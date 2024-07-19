# Lighthouse Tools + Coverage



## Lighthouse Tools

Lighthouse-Messung für die angegebenen URLs. Die Ergebnisse werden als Bericht in HTML und als JSON-File gespeichert.

### Messungen starten

```shell
node guestbookApp/guestbookMeasure.js
```

```shell
node helloWorldApp/helloWorldMeasure.js
```


Auswahl der Websites und Netzwerkbedingungen über die Kommandozeile.

Nach Auswahl für Netzwerk-Throttling Admin Passwort eingeben.
Throttle Installation: https://www.sitespeed.io/documentation/throttle/
Mit IPv6 wird die Version aus local_modules benötigt. (https://github.com/sitespeedio/throttle/issues/87#issuecomment-2110776611)

Interaktionen auf den Websites über Puppeteer.
Installations-Anleitung auf: https://pptr.dev

## Coverage

Ausgabe der Ergebnisse als Einzelmessungen und als Durchschnittswerte in CSV-Dateien.

### Messungen starten

```shell
node guestbookApp/guestbookCoverage.js
```

```shell
node helloWorldApp/helloWorldMeasure.js
```
