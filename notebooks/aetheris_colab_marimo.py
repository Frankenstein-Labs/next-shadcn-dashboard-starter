import os
import platform
import subprocess
import sys
import time

import marimo

app = marimo.App(width="full")


@app.cell

def _():
    import os
    import platform
    import subprocess
    import sys
    import time

    return os, platform, subprocess, sys, time


@app.cell

def _(os, platform, sys):
    print(f"Aetheris Cloud / marimo runtime: {platform.platform()}")
    print(f"Python: {sys.version.split()[0]}")
    print(f"Colab runtime marker: {os.environ.get('COLAB_RELEASE_TAG', 'not detected')}")


@app.cell

def _(subprocess):
    checks = {
        "python": ["python", "--version"],
        "pip": ["pip", "--version"],
        "git": ["git", "--version"],
    }
    results = {}
    for name, command in checks.items():
        completed = subprocess.run(command, capture_output=True, text=True, check=False)
        results[name] = {
            "returncode": completed.returncode,
            "output": (completed.stdout or completed.stderr).strip(),
        }
    results


@app.cell
def _(os, subprocess, sys, time):
    if os.environ.get("AETHERIS_RUN_HEAVY_TESTS") != "1":
        print("Heavy tests are disabled. Set AETHERIS_RUN_HEAVY_TESTS=1 in the Colab launcher to enable them.")
    else:
        started = time.perf_counter()
        workload = sum(index * index for index in range(2_000_000))
        elapsed = time.perf_counter() - started
        print(f"Heavy-test smoke workload completed in {elapsed:.2f}s; checksum={workload}")
        subprocess.run(
            [
                sys.executable,
                "-c",
                "import urllib.request; print(urllib.request.urlopen('https://aetheris-searxng-uj0m.onrender.com/search?q=marimo&format=json', timeout=30).status)",
            ],
            check=False,
        )


if __name__ == "__main__":
    app.run()
