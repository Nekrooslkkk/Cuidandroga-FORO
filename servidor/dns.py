#!/usr/bin/env python3
"""
CUIDANDROGA · DNS truqueado para el hotspot.

Responde que cuidandroga.cl (y www.cuidandroga.cl) es la IP del celular.
Todo lo demás lo reenvía a un DNS real, así internet sigue funcionando.

Uso: python dns.py <ip-a-responder> [puerto] [ip-donde-escuchar]
"""
import socket
import struct
import sys
import threading

DOMINIOS = {"cuidandroga.cl", "www.cuidandroga.cl"}
DNS_REALES = [("8.8.8.8", 53), ("1.1.1.1", 53)]


def leer_nombre(datos, pos):
    """Lee el nombre consultado (ej: cuidandroga.cl) desde el paquete DNS."""
    partes = []
    while True:
        largo = datos[pos]
        if largo == 0:
            return ".".join(partes).lower(), pos + 1
        partes.append(datos[pos + 1:pos + 1 + largo].decode("ascii", "replace"))
        pos += 1 + largo


def respuesta_local(consulta, ip):
    """Arma la respuesta 'cuidandroga.cl = ip del celular'."""
    ident = consulta[:2]
    nombre, fin = leer_nombre(consulta, 12)
    tipo = struct.unpack(">H", consulta[fin:fin + 2])[0]
    pregunta = consulta[12:fin + 4]
    if tipo == 1:  # registro A (IPv4)
        respuesta = (b"\xc0\x0c" + struct.pack(">HHIH", 1, 1, 60, 4) + socket.inet_aton(ip))
        cantidad = 1
    else:          # AAAA u otro: sin datos, el cliente usa el A
        respuesta, cantidad = b"", 0
    cabecera = ident + struct.pack(">HHHHH", 0x8180, 1, cantidad, 0, 0)
    return cabecera + pregunta + respuesta


def reenviar(consulta):
    """Pregunta a un DNS real y devuelve lo que conteste."""
    for servidor in DNS_REALES:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(3)
        try:
            s.sendto(consulta, servidor)
            return s.recvfrom(4096)[0]
        except OSError:
            continue
        finally:
            s.close()
    return None


def atender(sock, consulta, cliente, ip):
    try:
        nombre, _ = leer_nombre(consulta, 12)
        if nombre in DOMINIOS:
            sock.sendto(respuesta_local(consulta, ip), cliente)
            print(f"[DNS] {cliente[0]} pidió {nombre} -> {ip}", flush=True)
        else:
            r = reenviar(consulta)
            if r:
                sock.sendto(r, cliente)
    except Exception as e:  # un paquete raro no debe botar el servidor
        print(f"[DNS] error: {e}", flush=True)


def main():
    if len(sys.argv) < 2:
        sys.exit("Uso: python dns.py <ip-a-responder> [puerto] [ip-donde-escuchar]")
    ip = sys.argv[1]
    puerto = int(sys.argv[2]) if len(sys.argv) > 2 else 5353
    escucha = sys.argv[3] if len(sys.argv) > 3 else "0.0.0.0"
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.bind((escucha, puerto))
    print(f"[DNS] cuidandroga.cl -> {ip} (escuchando en {escucha}:{puerto})", flush=True)
    while True:
        consulta, cliente = sock.recvfrom(4096)
        threading.Thread(target=atender, args=(sock, consulta, cliente, ip), daemon=True).start()


if __name__ == "__main__":
    main()
