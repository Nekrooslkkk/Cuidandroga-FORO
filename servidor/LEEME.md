# CUIDANDROGA en el hotspot del celular

Cualquier aparato conectado al hotspot de tu celular abre **http://cuidandroga.cl** y ve el sitio, servido desde el mismo celular. No necesitas comprar el dominio: el celular responde el DNS "truqueado".

## Requisitos
- Android **con root** (Magisk). Sin root, Android no deja tocar el DNS del hotspot.
- **Termux** (desde F-Droid).

## Una sola vez
```
pkg install python git
git clone https://github.com/Nekrooslkkk/Cuidandroga-FORO
```

## Cada vez que lo quieras mostrar
1. Prende el hotspot del celular.
2. En Termux:
```
cd Cuidandroga-FORO
bash servidor/hotspot.sh
```
3. Conecta el notebook o el otro celular a tu hotspot y abre `http://cuidandroga.cl`.
4. Para apagar: `Ctrl + C`.

## Si algo falla
- **"No encontré el hotspot"**: mira el nombre de la interfaz con `su -c 'ip -4 addr'` (la que tiene una IP tipo 192.168.x.1 o 10.x.x.x) y pásalo: `bash servidor/hotspot.sh wlan2`.
- **El navegador no lo encuentra**: en el aparato conectado, apaga el "DNS privado" (Android) o el "DNS seguro" del navegador (Chrome/Edge), y escribe `http://` al principio.
- **El mismo celular que hace de servidor** no ve `cuidandroga.cl` (solo los que se conectan a su hotspot).

## Cómo funciona
- `dns.py`: cuando alguien pregunta por `cuidandroga.cl`, contesta con la IP del celular; todo lo demás lo reenvía a un DNS real, así internet sigue funcionando.
- `hotspot.sh`: con `iptables` desvía las consultas DNS de los conectados hacia `dns.py`, y el puerto 80 del celular hacia el sitio (puerto 8080). Al apagar, borra esas reglas.
