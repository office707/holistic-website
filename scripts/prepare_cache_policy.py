"""Merge the managed cache policy into the server's existing .htaccess."""
from pathlib import Path
import re
import sys


def merge_policy(existing: str, policy: str) -> str:
    start = '# BEGIN NORBU CACHE POLICY'
    end = '# END NORBU CACHE POLICY'
    if existing.count(start) != existing.count(end):
        raise ValueError('Incomplete managed cache block; refusing to change server rules')
    existing = re.sub(
        rf'(?m)^{re.escape(start)}\r?\n.*?^{re.escape(end)}\r?\n?',
        '', existing, flags=re.DOTALL,
    )
    # Append after existing rules; never replace unrelated redirects or settings.
    return existing.rstrip('\r\n') + ('\n\n' if existing.strip() else '') + policy.rstrip() + '\n'


if __name__ == '__main__':
    existing_path, policy_path, output_path = map(Path, sys.argv[1:])
    with existing_path.open(newline='') as source:
        existing = source.read()
    Path(output_path).write_text(merge_policy(existing, policy_path.read_text()))
