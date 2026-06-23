import logging

logger = logging.getLogger("eveai")
logger.setLevel(logging.DEBUG)
handler = logging.StreamHandler()
handler.setFormatter(
    logging.Formatter("%(asctime)s — %(name)s — %(levelname)s — %(message)s")
)
handler.setLevel(logging.DEBUG)
logger.addHandler(handler)
