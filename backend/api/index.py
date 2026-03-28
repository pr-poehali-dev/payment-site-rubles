"""
Основное API платёжной системы ПейРу.
Управление компаниями, платежами (комиссия 6%), заявками на подключение.
"""
import json
import os
import psycopg2
import psycopg2.extras
import secrets
from datetime import datetime

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p54479619_payment_site_rubles")
COMMISSION_RATE = 0.06

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Api-Key, X-Admin-Key",
}


def get_conn():
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    conn.autocommit = False
    return conn


S = SCHEMA  # короткий алиас для имени схемы


def json_serial(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")


def resp(status, body):
    return {
        "statusCode": status,
        "headers": {**CORS_HEADERS, "Content-Type": "application/json"},
        "body": json.dumps(body, default=json_serial, ensure_ascii=False),
    }


def is_admin(event):
    admin_key = os.environ.get("ADMIN_KEY", "")
    return event.get("headers", {}).get("X-Admin-Key") == admin_key and admin_key != ""


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")
    params = event.get("queryStringParameters") or {}
    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except Exception:
            pass

    conn = get_conn()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    try:
        # POST /request — заявка на подключение компании
        if method == "POST" and path.endswith("/request"):
            cur.execute(
                f"""INSERT INTO {S}.connection_requests
                    (company_name, inn, contact_name, contact_phone, contact_email, telegram_username, message)
                    VALUES (%s,%s,%s,%s,%s,%s,%s) RETURNING id, created_at""",
                (
                    body.get("company_name", ""),
                    body.get("inn"),
                    body.get("contact_name"),
                    body.get("contact_phone"),
                    body.get("contact_email"),
                    body.get("telegram_username"),
                    body.get("message"),
                ),
            )
            row = cur.fetchone()
            conn.commit()
            return resp(200, {"ok": True, "id": row["id"], "message": "Заявка принята! Напишите @sexwinds в Telegram."})

        # GET /requests — список заявок (только для админа)
        if method == "GET" and path.endswith("/requests"):
            if not is_admin(event):
                return resp(403, {"error": "Forbidden"})
            cur.execute(f"SELECT * FROM {S}.connection_requests ORDER BY created_at DESC")
            return resp(200, {"requests": [dict(r) for r in cur.fetchall()]})

        # POST /companies — создать компанию и кабинет (только админ)
        if method == "POST" and path.endswith("/companies"):
            if not is_admin(event):
                return resp(403, {"error": "Forbidden"})
            api_key = secrets.token_hex(24)
            cur.execute(
                f"""INSERT INTO {S}.companies
                    (name, inn, owner_name, owner_phone, owner_email, telegram_chat_id, api_key, status)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,'active') RETURNING *""",
                (
                    body.get("name", ""),
                    body.get("inn"),
                    body.get("owner_name"),
                    body.get("owner_phone"),
                    body.get("owner_email"),
                    body.get("telegram_chat_id"),
                    api_key,
                ),
            )
            company = dict(cur.fetchone())
            conn.commit()

            # Обновляем статус заявки если есть
            if body.get("request_id"):
                cur.execute(
                    f"UPDATE {S}.connection_requests SET status='approved' WHERE id=%s",
                    (body["request_id"],),
                )
                conn.commit()

            return resp(200, {"ok": True, "company": company})

        # GET /companies — список компаний (только админ)
        if method == "GET" and path.endswith("/companies"):
            if not is_admin(event):
                return resp(403, {"error": "Forbidden"})
            cur.execute(f"SELECT * FROM {S}.companies ORDER BY created_at DESC")
            return resp(200, {"companies": [dict(r) for r in cur.fetchall()]})

        # PUT /companies/{id}/status — изменить статус компании (только админ)
        if method == "PUT" and "/companies/" in path and "/status" in path:
            if not is_admin(event):
                return resp(403, {"error": "Forbidden"})
            company_id = path.split("/companies/")[1].split("/")[0]
            new_status = body.get("status", "active")
            cur.execute(
                f"UPDATE {S}.companies SET status=%s WHERE id=%s RETURNING *",
                (new_status, company_id),
            )
            company = cur.fetchone()
            conn.commit()
            return resp(200, {"ok": True, "company": dict(company)})

        # POST /payments — создать платёж (по API ключу компании)
        if method == "POST" and path.endswith("/payments"):
            api_key = event.get("headers", {}).get("X-Api-Key") or body.get("api_key")
            cur.execute(
                f"SELECT * FROM {S}.companies WHERE api_key=%s AND status='active'",
                (api_key,),
            )
            company = cur.fetchone()
            if not company:
                return resp(401, {"error": "Неверный API ключ или компания заблокирована"})

            amount = float(body.get("amount", 0))
            if amount <= 0:
                return resp(400, {"error": "Сумма должна быть больше 0"})

            commission = round(amount * COMMISSION_RATE, 2)
            net_amount = round(amount - commission, 2)

            cur.execute(
                f"""INSERT INTO {S}.payments
                    (company_id, external_id, description, amount, commission_amount, net_amount, status, payer_name, payer_phone, payer_email)
                    VALUES (%s,%s,%s,%s,%s,%s,'pending',%s,%s,%s) RETURNING *""",
                (
                    company["id"],
                    body.get("external_id"),
                    body.get("description"),
                    amount,
                    commission,
                    net_amount,
                    body.get("payer_name"),
                    body.get("payer_phone"),
                    body.get("payer_email"),
                ),
            )
            payment = dict(cur.fetchone())

            # Записываем доход владельца
            cur.execute(
                f"INSERT INTO {S}.owner_earnings (payment_id, company_id, amount) VALUES (%s,%s,%s)",
                (payment["id"], company["id"], commission),
            )
            conn.commit()
            return resp(200, {"ok": True, "payment": payment, "commission_rate": f"{int(COMMISSION_RATE*100)}%"})

        # GET /payments — платежи компании (по API ключу) или все (для админа)
        if method == "GET" and path.endswith("/payments"):
            if is_admin(event):
                cur.execute(
                    f"""SELECT p.*, c.name as company_name FROM {S}.payments p
                        LEFT JOIN {S}.companies c ON c.id=p.company_id
                        ORDER BY p.created_at DESC LIMIT 100"""
                )
            else:
                api_key = event.get("headers", {}).get("X-Api-Key") or params.get("api_key")
                cur.execute(f"SELECT id FROM {S}.companies WHERE api_key=%s", (api_key,))
                company = cur.fetchone()
                if not company:
                    return resp(401, {"error": "Неверный API ключ"})
                cur.execute(
                    f"SELECT * FROM {S}.payments WHERE company_id=%s ORDER BY created_at DESC LIMIT 50",
                    (company["id"],),
                )
            return resp(200, {"payments": [dict(r) for r in cur.fetchall()]})

        # GET /stats — статистика для админа
        if method == "GET" and path.endswith("/stats"):
            if not is_admin(event):
                return resp(403, {"error": "Forbidden"})
            cur.execute(f"SELECT COUNT(*) as total, SUM(amount) as volume FROM {S}.owner_earnings")
            earnings = dict(cur.fetchone())
            cur.execute(f"SELECT COUNT(*) as total FROM {S}.companies WHERE status='active'")
            companies = dict(cur.fetchone())
            cur.execute(f"SELECT COUNT(*) as total FROM {S}.payments")
            payments = dict(cur.fetchone())
            cur.execute(f"SELECT COUNT(*) as total FROM {S}.connection_requests WHERE status='new'")
            new_requests = dict(cur.fetchone())
            return resp(200, {
                "total_earnings": float(earnings["volume"] or 0),
                "total_earnings_count": int(earnings["total"] or 0),
                "active_companies": int(companies["total"]),
                "total_payments": int(payments["total"]),
                "new_requests": int(new_requests["total"]),
                "commission_rate": f"{int(COMMISSION_RATE*100)}%",
            })

        return resp(404, {"error": "Not found"})

    except Exception as e:
        conn.rollback()
        return resp(500, {"error": str(e)})
    finally:
        cur.close()
        conn.close()