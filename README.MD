# Node Mongo Migrator

A simple script to migrate data between mongo databases using basic filters.

## 🌐 Environment & Requirements

- Node.js `v22.14.0`
- `.env` file with connection URIs (`MONGO_URI_SOURCEs`, `MONGO_URI_DESTINATIONs`)

## ⚙️ Installation

```bash
npm install
````

## 🚀 Usage

This project processes Microsoft Teams messages sent via Power Automate, with the following format:

```json
{
  "mensaje": "<p style=\"margin-left:0\">someBDName|filter1|filter2</p>\n<p style=\"margin-left:0\">someBDName|filter1|filter2</p>",
  "trabajador": "Mecca Franco",
  "fecha": "2025-05-26T16:50:33.585Z",
  "asunto": "P-4421210"
}
```

### Message Fields:

* **asunto**: Subject of the request
* **trabajador**: Name of the employee who sent it
* **fecha**: Timestamp of the message
* **mensaje**: Body containing database and filter instructions

The `mensaje` field contains lines like:

```
bdRegistros|10482215888|202504
bdMige|10482215888|202504
```

These indicate:

* **Database/collection name**
* **RUC (tax ID)**
* **Period (e.g., 202504 = April 2025)**

The script splits and parses these lines to:

1. Extract data from the source MongoDB.
2. Delete matching records in the destination.
3. Insert the new data.

## 🌍 Notes

* The system uses **ngrok** to bypass VPN restrictions and allow Power Automate to reach your local environment.
* You can customize filters or extend functionality in `mongo_lito.js` post handler.
