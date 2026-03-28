"""
Telegram-бот для управления платёжной системой ПейРу.
Владелец: @sexwinds. Команды: /start /stats /requests /companies /approve /block
"""
import json
import os
import psycopg2
import psycopg2.extras
import urllib.request
from datetime import datetime

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p54479619_payment_site_rubles")
COMMISSION_RATE = 0.06

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


S = SCHEMA


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def tg_send(token, chat_id, text, parse_mode="HTML"):
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = json.dumps({"chat_id": chat_id, "text": text, "parse_mode": parse_mode}).encode()
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
    try:
        urllib.request.urlopen(req, timeout=10)
    except Exception:
        pass


def is_owner(chat_id):
    owner_id = os.environ.get("OWNER_CHAT_ID", "")
    return str(chat_id) == str(owner_id) and owner_id != ""


def json_serial(obj):
    if isinstance(obj, datetime):
        return obj.strftime("%d.%m.%Y %H:%M")
    raise TypeError(f"Type {type(obj)} not serializable")


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    token = os.environ.get("TG_BOT_TOKEN", "")
    if not token:
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": "ok"}

    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except Exception:
            return {"statusCode": 200, "headers": CORS_HEADERS, "body": "ok"}

    message = body.get("message") or body.get("callback_query", {}).get("message")
    if not message:
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": "ok"}

    chat_id = message["chat"]["id"]
    text = message.get("text", "").strip()
    callback_data = body.get("callback_query", {}).get("data", "")

    if not is_owner(chat_id):
        tg_send(token, chat_id,
            "⛔️ <b>Доступ запрещён.</b>\n\nЭтот бот — приватный инструмент управления платёжной системой ПейРу.\n\nДля подключения вашей компании напишите <b>@sexwinds</b>")
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": "ok"}

    conn = get_conn()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    try:
        # /start
        if text == "/start":
            tg_send(token, chat_id,
                "👑 <b>ПейРу — Панель управления</b>\n\n"
                "Добро пожаловать, владелец! Комиссия: <b>6%</b> с каждого платежа.\n\n"
                "📋 <b>Команды:</b>\n"
                "/stats — статистика и доходы\n"
                "/requests — новые заявки на подключение\n"
                "/companies — список активных компаний\n"
                "/approve_ID — одобрить заявку (ID из /requests)\n"
                "/block_ID — заблокировать компанию\n"
                "/unblock_ID — разблокировать компанию")

        # /stats
        elif text == "/stats":
            cur.execute(f"SELECT COUNT(*) as cnt, COALESCE(SUM(amount),0) as total FROM {S}.owner_earnings")
            earn = cur.fetchone()
            cur.execute(f"SELECT COUNT(*) as cnt FROM {S}.companies WHERE status='active'")
            active = cur.fetchone()
            cur.execute(f"SELECT COUNT(*) as cnt FROM {S}.companies WHERE status='pending'")
            pending_c = cur.fetchone()
            cur.execute(f"SELECT COUNT(*) as cnt FROM {S}.payments WHERE status='pending'")
            pend_p = cur.fetchone()
            cur.execute(f"SELECT COUNT(*) as cnt FROM {S}.payments WHERE status='success'")
            succ_p = cur.fetchone()
            cur.execute(f"SELECT COUNT(*) as cnt FROM {S}.connection_requests WHERE status='new'")
            new_req = cur.fetchone()

            tg_send(token, chat_id,
                f"📊 <b>Статистика ПейРу</b>\n\n"
                f"💰 <b>Ваш доход (комиссии 6%):</b> {float(earn['total']):,.2f} ₽\n"
                f"📦 Всего начислений: {earn['cnt']}\n\n"
                f"🏢 <b>Компании:</b>\n"
                f"  ✅ Активных: {active['cnt']}\n"
                f"  ⏳ На одобрении: {pending_c['cnt']}\n\n"
                f"💳 <b>Платежи:</b>\n"
                f"  ✅ Успешных: {succ_p['cnt']}\n"
                f"  ⏳ В обработке: {pend_p['cnt']}\n\n"
                f"📬 Новых заявок: <b>{new_req['cnt']}</b> — /requests")

        # /requests
        elif text == "/requests":
            cur.execute(f"SELECT * FROM {S}.connection_requests WHERE status='new' ORDER BY created_at DESC LIMIT 10")
            rows = cur.fetchall()
            if not rows:
                tg_send(token, chat_id, "📭 Новых заявок нет.")
            else:
                msg = f"📬 <b>Новые заявки ({len(rows)}):</b>\n\n"
                for r in rows:
                    msg += (
                        f"🆔 ID: <b>{r['id']}</b>\n"
                        f"🏢 {r['company_name']}\n"
                        f"📋 ИНН: {r['inn'] or '—'}\n"
                        f"👤 {r['contact_name'] or '—'}\n"
                        f"📱 {r['contact_phone'] or '—'}\n"
                        f"✈️ @{r['telegram_username'] or '—'}\n"
                        f"✅ Одобрить: /approve_{r['id']}\n"
                        f"❌ Отклонить: /reject_{r['id']}\n\n"
                    )
                tg_send(token, chat_id, msg)

        # /companies
        elif text == "/companies":
            cur.execute(f"SELECT id, name, inn, status, balance, created_at FROM {S}.companies ORDER BY created_at DESC LIMIT 15")
            rows = cur.fetchall()
            if not rows:
                tg_send(token, chat_id, "📭 Компаний пока нет.")
            else:
                msg = f"🏢 <b>Компании ({len(rows)}):</b>\n\n"
                for r in rows:
                    status_icon = "✅" if r["status"] == "active" else "⏳" if r["status"] == "pending" else "🚫"
                    msg += (
                        f"{status_icon} <b>{r['name']}</b> (ID:{r['id']})\n"
                        f"ИНН: {r['inn'] or '—'} | Баланс: {float(r['balance']):,.0f} ₽\n"
                        f"/block_{r['id']} | /unblock_{r['id']}\n\n"
                    )
                tg_send(token, chat_id, msg)

        # /approve_N — одобрить заявку и создать кабинет
        elif text.startswith("/approve_"):
            req_id = text.replace("/approve_", "").strip()
            cur.execute(f"SELECT * FROM {S}.connection_requests WHERE id=%s", (req_id,))
            req = cur.fetchone()
            if not req:
                tg_send(token, chat_id, f"❌ Заявка #{req_id} не найдена.")
            else:
                import secrets as sec
                api_key = sec.token_hex(24)
                cur.execute(
                    f"""INSERT INTO {S}.companies
                        (name, inn, owner_name, owner_phone, owner_email, telegram_chat_id, api_key, status)
                        VALUES (%s,%s,%s,%s,%s,%s,%s,'active') RETURNING id, api_key""",
                    (req["company_name"], req["inn"], req["contact_name"],
                     req["contact_phone"], req["contact_email"],
                     req["telegram_chat_id"], api_key),
                )
                company = cur.fetchone()
                cur.execute(f"UPDATE {S}.connection_requests SET status='approved' WHERE id=%s", (req_id,))
                conn.commit()
                tg_send(token, chat_id,
                    f"✅ <b>Компания подключена!</b>\n\n"
                    f"🏢 {req['company_name']}\n"
                    f"🆔 ID компании: {company['id']}\n"
                    f"🔑 API ключ:\n<code>{company['api_key']}</code>\n\n"
                    f"Отправьте API ключ клиенту — он нужен для автоматических платежей.")
                # Уведомить клиента если есть chat_id
                if req["telegram_chat_id"]:
                    tg_send(token, req["telegram_chat_id"],
                        f"🎉 <b>Ваша компания {req['company_name']} подключена к ПейРу!</b>\n\n"
                        f"🔑 Ваш API ключ:\n<code>{api_key}</code>\n\n"
                        f"Комиссия: 6% с каждого платежа.\n"
                        f"Используйте API ключ для создания платежей.")

        # /reject_N — отклонить заявку
        elif text.startswith("/reject_"):
            req_id = text.replace("/reject_", "").strip()
            cur.execute(f"UPDATE {S}.connection_requests SET status='rejected' WHERE id=%s RETURNING company_name", (req_id,))
            row = cur.fetchone()
            conn.commit()
            if row:
                tg_send(token, chat_id, f"❌ Заявка от <b>{row['company_name']}</b> отклонена.")
            else:
                tg_send(token, chat_id, f"❌ Заявка #{req_id} не найдена.")

        # /block_N — заблокировать компанию
        elif text.startswith("/block_"):
            company_id = text.replace("/block_", "").strip()
            cur.execute(f"UPDATE {S}.companies SET status='blocked' WHERE id=%s RETURNING name", (company_id,))
            row = cur.fetchone()
            conn.commit()
            if row:
                tg_send(token, chat_id, f"🚫 Компания <b>{row['name']}</b> заблокирована.")
            else:
                tg_send(token, chat_id, "❌ Компания не найдена.")

        # /unblock_N — разблокировать
        elif text.startswith("/unblock_"):
            company_id = text.replace("/unblock_", "").strip()
            cur.execute(f"UPDATE {S}.companies SET status='active' WHERE id=%s RETURNING name", (company_id,))
            row = cur.fetchone()
            conn.commit()
            if row:
                tg_send(token, chat_id, f"✅ Компания <b>{row['name']}</b> разблокирована.")
            else:
                tg_send(token, chat_id, "❌ Компания не найдена.")

        else:
            tg_send(token, chat_id,
                "📋 <b>Команды:</b>\n"
                "/start — главное меню\n"
                "/stats — доходы и статистика\n"
                "/requests — новые заявки\n"
                "/companies — компании\n"
                "/approve_ID — одобрить заявку\n"
                "/block_ID — заблокировать компанию")

    except Exception as e:
        conn.rollback()
        tg_send(token, chat_id, f"⚠️ Ошибка: {str(e)}")
    finally:
        cur.close()
        conn.close()

    return {"statusCode": 200, "headers": CORS_HEADERS, "body": "ok"}