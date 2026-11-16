#!/data/data/com.termux/files/usr/bin/bash
# CUIDANDROGA · prende el sitio en el hotspot del celular (Android con root + Termux)
# Uso:  bash servidor/hotspot.sh            (detecta solo la interfaz del hotspot)
#       bash servidor/hotspot.sh wlan2      (si la detección falla, le dices cuál es)
# Para apagar: Ctrl + C (borra las reglas y apaga todo)

PUERTO_WEB=8080
PUERTO_DNS=5353
CARPETA="$(cd "$(dirname "$0")/.." && pwd)"
IPBIN=/system/bin/ip
IPT=/system/bin/iptables

# 0. ¿hay root?
if ! su -c true 2>/dev/null; then
  echo "Sin root no se puede truquear el DNS del hotspot."
  echo "Igual puedes abrir el sitio en: http://IP-DEL-CELULAR:$PUERTO_WEB"
  exit 1
fi

# 1. interfaz del hotspot
IFACE="$1"
if [ -z "$IFACE" ]; then
  for i in ap0 swlan0 wlan1 wlan2 softap0 ap_br_wlan2 ap_br_wlan1; do
    if su -c "$IPBIN -4 addr show $i" 2>/dev/null | grep -q "inet "; then IFACE="$i"; break; fi
  done
fi
if [ -z "$IFACE" ]; then
  echo "No encontré el hotspot. ¿Está prendido? Mira las interfaces con:  su -c 'ip -4 addr'"
  exit 1
fi
IP=$(su -c "$IPBIN -4 addr show $IFACE" | awk '/inet /{split($2,a,"/"); print a[1]; exit}')
echo "Hotspot: $IFACE  ·  IP del celular: $IP"

# 2. reglas: DNS de los conectados -> nuestro DNS ; puerto 80 del celular -> 8080
REGLAS=(
  "-t nat -I PREROUTING -i $IFACE -p udp --dport 53 -j REDIRECT --to-ports $PUERTO_DNS"
  "-t nat -I PREROUTING -i $IFACE -p tcp -d $IP --dport 80 -j REDIRECT --to-ports $PUERTO_WEB"
  "-I INPUT -i $IFACE -p udp --dport $PUERTO_DNS -j ACCEPT"
  "-I INPUT -i $IFACE -p tcp --dport $PUERTO_WEB -j ACCEPT"
)
apagar() {
  echo; echo "Apagando CUIDANDROGA..."
  for r in "${REGLAS[@]}"; do su -c "$IPT ${r/-I /-D }" 2>/dev/null; done
  kill $PID_DNS $PID_WEB 2>/dev/null
  exit 0
}
trap apagar INT TERM
for r in "${REGLAS[@]}"; do su -c "$IPT $r"; done

# 3. DNS truqueado + sitio web
python "$CARPETA/servidor/dns.py" "$IP" "$PUERTO_DNS" "$IP" & PID_DNS=$!
(cd "$CARPETA" && python -m http.server "$PUERTO_WEB" --bind "$IP" >/dev/null 2>&1) & PID_WEB=$!

echo
echo "  Listo. Conecta otro aparato a tu hotspot y abre:  http://cuidandroga.cl"
echo "  (Ctrl + C para apagar)"
echo
wait
