# main.py

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        # "main:app", host="0.0.0.0", port=8000, reload=settings.DEBUG, log_level="info"
        "main:app",
        reload=settings.DEBUG,
        log_level="info",
    )
