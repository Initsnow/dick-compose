from anyio.from_thread import start_blocking_portal
from pytauri import (
    builder_factory,
    context_factory,
)

from .llm import commands


def main() -> int:
    with start_blocking_portal("asyncio") as portal:  # or `trio`
        app = builder_factory().build(
            context=context_factory(),
            invoke_handler=commands.generate_handler(portal),
        )
        exit_code = app.run_return()
        return exit_code
