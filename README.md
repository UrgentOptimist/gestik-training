# 🤚 Gestik-Training

Eine Progressive Web App (PWA) zur Rehabilitation der Hand- und Armkoordination für Senioren nach leichten Schlaganfällen.

## 🎯 Konzept

Die App zeigt Handzeichen oder Armbewegungen an, die der Nutzer vor der Kamera nachmachen soll. Mit MediaPipe Hands wird erkannt, ob die Geste korrekt ausgeführt wird.

## ✨ Features

- **✋ Handzeichen-Modus**: 👍 👎 ✌️ 🤙 👊 ✋ ☝️ 🤞 👌 🖐️
- **💪 Armbewegungen-Modus**: 🙌 👐 🙏 👋 💪
- **🤲 Hand-Auswahl**: Links, Rechts oder Beide trainieren
- **📈 Adaptive Schwierigkeit**: Passt Zeitlimit und Haltezeit an
- **🎉 Positives Feedback**: Ermutigende Nachrichten und Animationen
- **📷 Kamera-basierte Erkennung**: MediaPipe Hands für präzise Gestenerkennung
- **📱 PWA**: Installierbar auf Android und iOS

## 🚀 Installation

### Als Web-App (empfohlen)

1. Öffne die App im Chrome-Browser
2. Tippe auf Menü → "Zum Startbildschirm hinzufügen"
3. Die App erscheint wie eine normale App

### Lokale Entwicklung

```bash
npx serve .
# Öffne https://localhost:3000 (HTTPS erforderlich für Kamera!)
```

**Wichtig:** Die Kamera-API erfordert HTTPS oder localhost.

## 🎮 Spielanleitung

1. **Modus wählen**: Handzeichen oder Armbewegungen
2. **Hand wählen**: Links, Rechts oder Beide
3. **Schwierigkeit wählen**: Leicht (15s), Mittel (10s), Schwer (7s)
4. **Kamera starten**: Erlaube den Kamerazugriff
5. **Nachmachen**: Zeige das angezeigte Handzeichen in die Kamera
6. **Halten**: Halte die Geste bis der Fortschrittsring voll ist

### Erkannte Handzeichen

| Emoji | Name | Erkennung |
|-------|------|-----------|
| 👍 | Daumen hoch | Daumen nach oben, Finger geschlossen |
| 👎 | Daumen runter | Daumen nach unten, Finger geschlossen |
| ✌️ | Peace/Victory | Zeige- und Mittelfinger gestreckt |
| 🤙 | Hang Loose | Daumen und kleiner Finger gestreckt |
| 👊 | Faust | Alle Finger geschlossen |
| ✋ | Offene Hand | Alle Finger gestreckt |
| ☝️ | Zeigefinger | Nur Zeigefinger gestreckt |
| 👌 | OK-Zeichen | Daumen und Zeigefinger bilden Kreis |

### Armbewegungen

| Emoji | Name | Erkennung |
|-------|------|-----------|
| 🙌 | Hände hoch | Beide Hände über Schulterhöhe |
| 👐 | Hände offen | Beide Hände offen zeigen |
| 🙏 | Hände zusammen | Handflächen aneinander |
| 👋 | Winken | Hand seitlich bewegen |
| 💪 | Muskel zeigen | Faust machen, Arm anwinkeln |

## 🏗️ Technische Details

- **MediaPipe Hands**: Google's ML-Modell für Hand-Tracking
- **21 Landmark-Punkte**: Pro Hand für präzise Positionserkennung
- **Vanilla JS**: Keine Frameworks, schnelle Ladezeit
- **PWA**: Service Worker für Offline-Caching

## 📁 Projektstruktur

```
gestik-training-app/
├── index.html      # Haupt-HTML
├── style.css       # Styling
├── game.js         # Spiellogik + Gestenerkennung
├── sw.js           # Service Worker
├── manifest.json   # PWA Manifest
├── icons/          # App Icons
└── README.md
```

## 🎨 Anpassung

### Neue Gesten hinzufügen

In `game.js` im `handGestures` Array:

```javascript
{
    emoji: '🤘',
    name: 'Rock',
    detect: (landmarks) => {
        // Erkennungslogik hier
        return isRockGesture;
    }
}
```

## 📋 Therapeutischer Hintergrund

Diese App unterstützt die Rehabilitation durch:

- **Feinmotorik**: Präzise Fingerstellungen trainieren
- **Koordination**: Augen-Hand-Koordination verbessern
- **Gedächtnis**: Gesten erkennen und nachahmen
- **Motivation**: Gamification fördert regelmäßiges Üben
- **Beidseitiges Training**: Gezielt schwächere Hand trainieren

**Hinweis**: Diese App ersetzt keine professionelle Therapie.

## 🔒 Datenschutz

- Kamerabilder werden **nur lokal** im Browser verarbeitet
- **Keine Daten** werden an Server gesendet
- MediaPipe läuft vollständig im Browser

## 📄 Lizenz

MIT License - Frei verwendbar für therapeutische Zwecke.
