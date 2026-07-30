# Integrazione Alexa <-> Home Assistant (AWS Lambda, senza Nabu Casa)

Documentazione salvata il 30/07/2026. Setup verificato funzionante.
HA versione 2026.7.4, componenti `alexa` e `alexa_devices` caricati.

## Dati generali
- Account AWS: f.castiglioni@gmail.com
- Regione: eu-west-1
- Lambda ARN: `arn:aws:lambda:eu-west-1:240029900423:function:HomeAssistant`
- Skill ID: `amzn1.ask.skill.a7c41974-7e87-4dd8-9d2a-dcc271082e11`
- Variabile ambiente Lambda: `BASE_URL=https://fly98.duckdns.org:8123`
- Home Assistant: `https://fly98.duckdns.org` (443 esterna, 8123 interna)

## Account linking - configurazione che funziona
- Auth Scheme: **Credentials in request body** (NON HTTP Basic)
- Access Token URI: porta **443** (NON :8123)
- client_id: `https://layla.amazon.com/` (lo slash finale e obbligatorio)
- client_secret: in `secrets.yaml` come `alexa_client_secret`
- L'account linking DEVE essere fatto su **rete 5G/dati mobili**, non su WiFi
  locale (problema di NAT loopback)

## Blocco configuration.yaml
```yaml
alexa:
  smart_home:
    endpoint: https://api.eu.amazonalexa.com/v3/events
    client_id: !secret alexa_client_id
    client_secret: !secret alexa_client_secret
    filter:
      include_entities:
        - script.gestisci_cancello
        - climate.wellis_spa_thermostat_1
        - light.wellis_spa_light_1
        - fan.wellis_spa_pump_1
        - script.condizionatore_notte
        - script.aria_camera_1
        - script.aria_camera_2
        - script.aria_camera_3
```

## Note operative
- Endpoint eventi Alexa EU: `api.eu.amazonalexa.com/v3/events`
- Dopo modifiche al blocco `alexa:` serve **RIAVVIO COMPLETO** di HA, non il reload
- Dopo il riavvio: "Alexa, cerca i dispositivi"
- Gli script HA appaiono in Alexa come **scene/scenari**, si attivano con
  "Alexa, attiva [nome]"
- Per frasi libere (es. "Alexa, condizionatore notte") va creata una Routine
  Alexa con quella frase come trigger
- Indentazione YAML: ogni voce della lista con trattino e 8 spazi

## Candidati da aggiungere al filtro (creati il 29/07/2026)
- `cover.divano` (unifica i due bot SwitchBot apri/chiudi)
- `script.notte_salone` (sostituisce la routine Alexa "notte")
- `button.cancello_open_door` (apertura cancello Ring)
- `lock.porta_casa` (Nuki, integrata in HA il 29/07/2026)
