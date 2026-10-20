#!/usr/bin/env python3
"""
Generate buggy.py and golden_bug.json for all 15 Level 1 exercises.
Each exercise has exactly ONE logical bug injected, keeping code syntactically valid.
"""

import ast
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent / "dataset" / "Level_1_Fundamentals"

EXERCISES_DATA = {
    "armstrong_numbers": {
        "buggy_code": (
            "def is_armstrong_number(number):\n"
            "    return sum(pow(int(digit), len(str(number)) - 1) for digit in str(number)) == number\n"
        ),
        "golden_bug": {
            "line_number": 2,
            "severity": "High",
            "bug_description": "Off-by-one error in exponent: `len(str(number)) - 1` raises each digit to `num_digits - 1` instead of `num_digits`, causing false negatives for all Armstrong numbers.",
            "suggested_fix": "Change `len(str(number)) - 1` to `len(str(number))` so each digit is raised to the total number of digits."
        }
    },
    "bob": {
        "buggy_code": (
            "def response(hey_bob):\n"
            "    hey_bob = hey_bob.strip()\n"
            "\n"
            "    if _is_silence(hey_bob):\n"
            "        return 'Fine. Be that way!'\n"
            "    if _is_shouting(hey_bob):\n"
            "        if _is_question(hey_bob):\n"
            "            return \"Calm down, I know what I'm doing!\"\n"
            "        else:\n"
            "            return 'Whoa, chill out!'\n"
            "    elif _is_question(hey_bob):\n"
            "        return 'Sure.'\n"
            "    else:\n"
            "        return 'Whatever.'\n"
            "\n"
            "\n"
            "def _is_silence(hey_bob):\n"
            "    return hey_bob == ''\n"
            "\n"
            "\n"
            "def _is_shouting(hey_bob):\n"
            "    return hey_bob.isupper()\n"
            "\n"
            "\n"
            "def _is_question(hey_bob):\n"
            "    return '?' in hey_bob\n"
        ),
        "golden_bug": {
            "line_number": 26,
            "severity": "Medium",
            "bug_description": "`_is_question` checks `'?' in hey_bob` instead of `hey_bob.endswith('?')`. Any statement containing a question mark anywhere (e.g., 'What? No!') is incorrectly classified as a question.",
            "suggested_fix": "Change line 26 to `return hey_bob.endswith('?')` so only statements ending with '?' are treated as questions."
        }
    },
    "collatz_conjecture": {
        "buggy_code": (
            "def steps(number):\n"
            "    if number <= 0:\n"
            "        raise ValueError('Only positive integers are allowed')\n"
            "\n"
            "    step_count = 0\n"
            "    while number >= 1:\n"
            "        if is_odd(number):\n"
            "            number = number * 3 + 1\n"
            "        else:\n"
            "            number = number / 2\n"
            "        step_count += 1\n"
            "\n"
            "    return step_count\n"
            "\n"
            "\n"
            "def is_odd(number):\n"
            "    return number % 2 == 1\n"
        ),
        "golden_bug": {
            "line_number": 6,
            "severity": "High",
            "bug_description": "Off-by-one boundary in loop condition: `while number >= 1:` results in an infinite loop because when `number` reaches 1, it continues cycling 1 -> 4 -> 2 -> 1 endlessly.",
            "suggested_fix": "Change `while number >= 1:` to `while number > 1:` so the loop halts as soon as the sequence reaches 1."
        }
    },
    "darts": {
        "buggy_code": (
            "from math import sqrt\n"
            "\n"
            "# X, and Y variable names against [pylint]: C0104, but is the same as the stub, advise not to change this.\n"
            "def score(x, y):\n"
            "    dart_location = sqrt(x * x + y * y)\n"
            "\n"
            "    if dart_location <= 1.0:\n"
            "        return 10\n"
            "    elif dart_location <= 5.0:\n"
            "        return 5\n"
            "    elif dart_location < 10.0:\n"
            "        return 1\n"
            "    else:\n"
            "        return 0\n"
        ),
        "golden_bug": {
            "line_number": 11,
            "severity": "Medium",
            "bug_description": "Boundary condition off-by-one: `dart_location < 10.0` uses strict inequality instead of `<= 10.0`. Darts landing exactly on the outer circle boundary (radius 10.0) earn 0 points instead of 1.",
            "suggested_fix": "Change `elif dart_location < 10.0:` to `elif dart_location <= 10.0:`."
        }
    },
    "difference_of_squares": {
        "buggy_code": (
            "def square_of_sum(number):\n"
            "    sum_ = number * (number + 1) / 2\n"
            "    return sum_ * sum_\n"
            "\n"
            "\n"
            "def sum_of_squares(number):\n"
            "    numerator = number * (number + 1) * (2 * number + 1)\n"
            "    return numerator / 6\n"
            "\n"
            "\n"
            "def difference_of_squares(number):\n"
            "    return sum_of_squares(number) - square_of_sum(number)\n"
        ),
        "golden_bug": {
            "line_number": 12,
            "severity": "High",
            "bug_description": "Operand inversion: `sum_of_squares(number) - square_of_sum(number)` subtracts the square of sum from the sum of squares, returning negative numbers instead of positive difference.",
            "suggested_fix": "Change line 12 to `return square_of_sum(number) - sum_of_squares(number)`."
        }
    },
    "grains": {
        "buggy_code": (
            "def square(number):\n"
            "    if number == 0:\n"
            "        raise ValueError('square must be between 1 and 64')\n"
            "    elif number < 0:\n"
            "        raise ValueError('square must be between 1 and 64')\n"
            "    elif number > 64:\n"
            "        raise ValueError('square must be between 1 and 64')\n"
            "\n"
            "    return 2 ** number\n"
            "\n"
            "\n"
            "def total():\n"
            "    return (2 ** 64) - 1\n"
        ),
        "golden_bug": {
            "line_number": 9,
            "severity": "High",
            "bug_description": "Off-by-one exponent: `2 ** number` doubles the count for every square (square 1 should have 2^0 = 1 grain, but returns 2^1 = 2).",
            "suggested_fix": "Change line 9 to `return 2 ** (number - 1)`."
        }
    },
    "hamming": {
        "buggy_code": (
            "def distance(strand_a, strand_b):\n"
            "    if len(strand_a) != len(strand_b):\n"
            "        raise ValueError('Strands must be of equal length.')\n"
            "\n"
            "    return sum(a_part == b_part for a_part, b_part in zip(strand_a, strand_b))\n"
        ),
        "golden_bug": {
            "line_number": 5,
            "severity": "High",
            "bug_description": "Inverted equality operator: `a_part == b_part` counts the matching nucleotides instead of mismatches, returning nucleotide similarity rather than Hamming distance.",
            "suggested_fix": "Change `a_part == b_part` to `a_part != b_part`."
        }
    },
    "isogram": {
        "buggy_code": (
            "def is_isogram(string):\n"
            "    characters_lower = [char.lower() for char in string]\n"
            "    return len(set(characters_lower)) == len(characters_lower)\n"
        ),
        "golden_bug": {
            "line_number": 2,
            "severity": "Medium",
            "bug_description": "Missing filter for non-alphabetic characters: `[char.lower() for char in string]` includes spaces and hyphens. Valid isograms with repeated spaces or hyphens (like 'six-year-old') incorrectly return False.",
            "suggested_fix": "Filter non-alphabetic characters using `char.isalpha()`: `characters_lower = [char.lower() for char in string if char.isalpha()]`."
        }
    },
    "leap": {
        "buggy_code": (
            "def leap_year(year):\n"
            "    return year % 4 == 0 and (year % 100 == 0 or year % 400 == 0)\n"
        ),
        "golden_bug": {
            "line_number": 2,
            "severity": "High",
            "bug_description": "Inverted century condition: `year % 100 == 0` requires leap years to be century years instead of excluding them, marking common leap years (e.g., 2024) as False and non-leap century years (e.g., 1900) as True.",
            "suggested_fix": "Change `year % 100 == 0` to `year % 100 != 0`."
        }
    },
    "pangram": {
        "buggy_code": (
            "from string import ascii_lowercase\n"
            "\n"
            "\n"
            "def is_pangram(sentence):\n"
            "    return all(char in sentence for char in ascii_lowercase)\n"
        ),
        "golden_bug": {
            "line_number": 5,
            "severity": "Medium",
            "bug_description": "Missing case-insensitivity: `char in sentence` checks lowercase letters against the raw sentence without `.lower()`. Sentences containing uppercase letters will fail the pangram check.",
            "suggested_fix": "Change `char in sentence` to `char in sentence.lower()`."
        }
    },
    "raindrops": {
        "buggy_code": (
            "def convert(number):\n"
            "    \"\"\"\n"
            "    Converts a number to a string according to the raindrop sounds.\n"
            "    \"\"\"\n"
            "\n"
            "    result = ''\n"
            "    if number % 3 == 0:\n"
            "        result += 'Pling'\n"
            "    elif number % 5 == 0:\n"
            "        result += 'Plang'\n"
            "    if number % 7 == 0:\n"
            "        result += 'Plong'\n"
            "\n"
            "    if not result:\n"
            "        result = str(number)\n"
            "    return result\n"
        ),
        "golden_bug": {
            "line_number": 9,
            "severity": "Medium",
            "bug_description": "Mutually exclusive branching: Using `elif number % 5 == 0:` instead of `if` prevents numbers divisible by both 3 and 5 (such as 15 or 30) from concatenating 'Plang', returning only 'Pling'.",
            "suggested_fix": "Change `elif number % 5 == 0:` on line 9 to `if number % 5 == 0:`."
        }
    },
    "resistor_color": {
        "buggy_code": (
            "COLORS = [\n"
            "    'black',\n"
            "    'brown',\n"
            "    'red',\n"
            "    'orange',\n"
            "    'yellow',\n"
            "    'green',\n"
            "    'blue',\n"
            "    'violet',\n"
            "    'grey',\n"
            "    'white'\n"
            "]\n"
            "\n"
            "\n"
            "def color_code(color):\n"
            "    return COLORS.index(color) + 1\n"
            "\n"
            "\n"
            "def colors():\n"
            "    return COLORS\n"
        ),
        "golden_bug": {
            "line_number": 16,
            "severity": "High",
            "bug_description": "Off-by-one index adjustment: Adding `+ 1` makes resistor color codes 1-indexed instead of 0-indexed (e.g. black is evaluated as 1 instead of 0).",
            "suggested_fix": "Remove `+ 1` and return `COLORS.index(color)` directly."
        }
    },
    "reverse_string": {
        "buggy_code": (
            "def reverse(text=\"\"):\n"
            "    return text[::1]\n"
        ),
        "golden_bug": {
            "line_number": 2,
            "severity": "High",
            "bug_description": "Wrong slice step direction: `text[::1]` traverses forward with step +1 instead of backward with step -1, returning the original string unreversed.",
            "suggested_fix": "Change slice step to `-1`: `return text[::-1]`."
        }
    },
    "triangle": {
        "buggy_code": (
            "def valid(sides):\n"
            "    return sum(sorted(sides)[:2]) >= sorted(sides)[2] and all(\n"
            "        side > 0 for side in sides\n"
            "    )\n"
            "\n"
            "\n"
            "def equilateral(sides):\n"
            "    return valid(sides) and any(sides[0] == side for side in sides)\n"
            "\n"
            "\n"
            "def isosceles(sides):\n"
            "    return valid(sides) and any(\n"
            "        side_1 == side_2 for side_1, side_2 in zip(sorted(sides), sorted(sides)[1:])\n"
            "    )\n"
            "\n"
            "\n"
            "def scalene(sides):\n"
            "    return valid(sides) and not isosceles(sides)\n"
        ),
        "golden_bug": {
            "line_number": 8,
            "severity": "High",
            "bug_description": "Wrong logical quantifier: `any(sides[0] == side for side in sides)` checks if any side equals `sides[0]`, which is trivially True for every triangle (`sides[0] == sides[0]`), incorrectly classifying every valid triangle as equilateral.",
            "suggested_fix": "Change `any` to `all`: `all(sides[0] == side for side in sides)`."
        }
    },
    "two_fer": {
        "buggy_code": (
            "def two_fer(name=None):\n"
            "    return f'One for {name}, one for me.'\n"
        ),
        "golden_bug": {
            "line_number": 1,
            "severity": "Medium",
            "bug_description": "Missing default name handling: Setting `name=None` causes `two_fer()` without arguments to return 'One for None, one for me.' instead of 'One for you, one for me.'",
            "suggested_fix": "Set default value to `'you'`: `def two_fer(name='you'):`"
        }
    }
}


def main():
    print("=" * 65)
    print("Injecting Golden Bugs into Level 1: Fundamentals")
    print("=" * 65)

    if not BASE_DIR.exists():
        raise FileNotFoundError(f"Directory not found: {BASE_DIR}")

    success_count = 0

    for exercise_name, data in EXERCISES_DATA.items():
        ex_dir = BASE_DIR / exercise_name
        if not ex_dir.exists():
            print(f"[!] Warning: Directory {ex_dir} does not exist, creating it.")
            ex_dir.mkdir(parents=True, exist_ok=True)

        buggy_code = data["buggy_code"]
        golden_bug = data["golden_bug"]

        # 1. Validate syntax
        try:
            ast.parse(buggy_code)
        except SyntaxError as e:
            print(f"[X] Syntax error in {exercise_name}: {e}")
            continue

        # 2. Write buggy.py
        buggy_path = ex_dir / "buggy.py"
        buggy_path.write_text(buggy_code, encoding="utf-8")

        # 3. Write golden_bug.json
        golden_path = ex_dir / "golden_bug.json"
        golden_path.write_text(json.dumps(golden_bug, indent=2, ensure_ascii=False), encoding="utf-8")

        success_count += 1
        print(f"[{success_count:02d}/15] {exercise_name:22} -> Line {golden_bug['line_number']} [{golden_bug['severity']}]")

    print("=" * 65)
    print(f"Successfully processed {success_count}/15 exercises with valid syntax and golden bugs.")
    print("=" * 65)


if __name__ == "__main__":
    main()
