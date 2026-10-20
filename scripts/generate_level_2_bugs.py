#!/usr/bin/env python3
"""
Generate buggy.py and golden_bug.json for all 10 Level 2 exercises (Software Engineering / OOP).
Each exercise has exactly ONE realistic Software Engineering bug injected.
Validates all buggy code using ast.parse().
"""

import ast
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent / "dataset" / "Level_2_Software_Engineering"

EXERCISES_DATA = {
    "abstract_factory": {
        "buggy_code": (
            '"""\n'
            '*What is this pattern about?\n'
            'In Java and other languages, the Abstract Factory Pattern serves to provide an interface for\n'
            'creating related/dependent objects without need to specify their actual class.\n'
            '"""\n'
            '\n'
            'import random\n'
            '\n'
            '\n'
            'class Pet:\n'
            '    def __init__(self, name: str) -> None:\n'
            '        self.name = name\n'
            '\n'
            '    def speak(self) -> None:\n'
            '        raise NotImplementedError\n'
            '\n'
            '    def __str__(self) -> str:\n'
            '        raise NotImplementedError\n'
            '\n'
            '\n'
            'class Dog(Pet):\n'
            '    def speak(self) -> None:\n'
            '        print("woof")\n'
            '\n'
            '    def __str__(self) -> str:\n'
            '        return f"Dog<{self.name}>"\n'
            '\n'
            '\n'
            'class Cat(Pet):\n'
            '    def speak(self) -> None:\n'
            '        print("meow")\n'
            '\n'
            '    def __str__(self) -> str:\n'
            '        return f"Cat<{self.name}>"\n'
            '\n'
            '\n'
            'class PetShop:\n'
            '    """A pet shop"""\n'
            '\n'
            '    def __init__(self, animal_factory: type[Pet], inventory: list[str] = []) -> None:\n'
            '        """pet_factory is our abstract factory. We can set it at will."""\n'
            '        self.pet_factory = animal_factory\n'
            '        self.inventory = inventory\n'
            '\n'
            '    def buy_pet(self, name: str) -> Pet:\n'
            '        """Creates and shows a pet using the abstract factory"""\n'
            '        pet = self.pet_factory(name)\n'
            '        self.inventory.append(name)\n'
            '        print(f"Here is your lovely {pet}")\n'
            '        return pet\n'
            '\n'
            '\n'
            'def main() -> None:\n'
            '    cat_shop = PetShop(Cat)\n'
            '    pet = cat_shop.buy_pet("Lucy")\n'
            '    pet.speak()\n'
            '\n'
            '\n'
            'if __name__ == "__main__":\n'
            '    main()\n'
        ),
        "golden_bug": {
            "line_number": 40,
            "severity": "High",
            "bug_description": "Mutable default argument: `inventory: list[str] = []` in `PetShop.__init__` is evaluated once when the function is defined. All `PetShop` instances created without providing an explicit list will share the exact same list instance in memory, causing cross-instance state leakage.",
            "suggested_fix": "Change the parameter default to `inventory: list[str] | None = None` and initialize it inside `__init__` with `self.inventory = inventory if inventory is not None else []`."
        }
    },
    "adapter": {
        "buggy_code": (
            '"""\n'
            'The Adapter pattern provides a different interface for a class.\n'
            '"""\n'
            '\n'
            'from collections.abc import Callable\n'
            'from typing import Any, TypeVar\n'
            '\n'
            'T = TypeVar("T")\n'
            '\n'
            '\n'
            'class Dog:\n'
            '    def __init__(self) -> None:\n'
            '        self.name = "Dog"\n'
            '\n'
            '    def bark(self) -> str:\n'
            '        return "woof!"\n'
            '\n'
            '\n'
            'class Cat:\n'
            '    def __init__(self) -> None:\n'
            '        self.name = "Cat"\n'
            '\n'
            '    def meow(self) -> str:\n'
            '        return "meow!"\n'
            '\n'
            '\n'
            'class Adapter:\n'
            '    """Adapts an object by replacing methods."""\n'
            '\n'
            '    def __init__(self, obj: T, **adapted_methods: Callable[..., Any]) -> None:\n'
            '        self.obj = obj\n'
            '        self.__dict__.update(adapted_methods)\n'
            '\n'
            '    def __getattr__(self, attr: str) -> Any:\n'
            '        """All non-adapted calls are passed to the object."""\n'
            '        try:\n'
            '            return getattr(self.obj, attr)\n'
            '        except AttributeError:\n'
            '            return None\n'
            '\n'
            '    def original_dict(self) -> dict[str, Any]:\n'
            '        return self.obj.__dict__\n'
            '\n'
            '\n'
            'def main():\n'
            '    dog = Dog()\n'
            '    adapted_dog = Adapter(dog, make_noise=dog.bark)\n'
            '    print(adapted_dog.make_noise())\n'
            '\n'
            '\n'
            'if __name__ == "__main__":\n'
            '    main()\n'
        ),
        "golden_bug": {
            "line_number": 39,
            "severity": "Medium",
            "bug_description": "Silent attribute swallowing: In `Adapter.__getattr__`, catching `AttributeError` and returning `None` masks typos and missing attributes. Instead of raising an expected `AttributeError`, accessing missing attributes silently returns `None`, producing confusing downstream `'NoneType' object is not callable` errors.",
            "suggested_fix": "Remove the `try...except AttributeError` block in `__getattr__` and let `getattr(self.obj, attr)` raise `AttributeError` naturally when an attribute does not exist."
        }
    },
    "builder": {
        "buggy_code": (
            '"""\n'
            'Decouples the creation of a complex object and its representation.\n'
            '"""\n'
            '\n'
            '\n'
            '# Abstract Building\n'
            'class Building:\n'
            '    floor: str\n'
            '    size: str\n'
            '    features: list[str] = []\n'
            '\n'
            '    def __init__(self) -> None:\n'
            '        self.build_floor()\n'
            '        self.build_size()\n'
            '\n'
            '    def build_floor(self):\n'
            '        raise NotImplementedError\n'
            '\n'
            '    def build_size(self):\n'
            '        raise NotImplementedError\n'
            '\n'
            '    def __repr__(self) -> str:\n'
            '        return f"Floor: {self.floor} | Size: {self.size} | Features: {self.features}"\n'
            '\n'
            '\n'
            '# Concrete Buildings\n'
            'class House(Building):\n'
            '    def build_floor(self) -> None:\n'
            '        self.floor = "One"\n'
            '        self.features.append("Hardwood")\n'
            '\n'
            '    def build_size(self) -> None:\n'
            '        self.size = "Big"\n'
            '\n'
            '\n'
            'class Flat(Building):\n'
            '    def build_floor(self) -> None:\n'
            '        self.floor = "More than One"\n'
            '        self.features.append("Elevator Access")\n'
            '\n'
            '    def build_size(self) -> None:\n'
            '        self.size = "Small"\n'
            '\n'
            '\n'
            'def main():\n'
            '    house = House()\n'
            '    print(house)\n'
            '    flat = Flat()\n'
            '    print(flat)\n'
            '\n'
            '\n'
            'if __name__ == "__main__":\n'
            '    main()\n'
        ),
        "golden_bug": {
            "line_number": 10,
            "severity": "High",
            "bug_description": "Class variable vs. instance variable confusion: `features: list[str] = []` is declared as a mutable class-level attribute on `Building`. All instances of `House`, `Flat`, and any `Building` subclass append to and share the exact same list, causing cross-instance state pollution.",
            "suggested_fix": "Define `self.features: list[str] = []` inside `Building.__init__` rather than at class scope so each building instance maintains its own separate feature list."
        }
    },
    "command": {
        "buggy_code": (
            '"""\n'
            'Command pattern decouples the object invoking a job from the one who knows how to do it.\n'
            '"""\n'
            '\n'
            '\n'
            'class HideFileCommand:\n'
            '    def __init__(self) -> None:\n'
            '        self._hidden_files: list[str] = []\n'
            '\n'
            '    def execute(self, filename: str) -> None:\n'
            '        print(f"hiding {filename}")\n'
            '        self._hidden_files.append(filename)\n'
            '\n'
            '    def undo(self) -> None:\n'
            '        filename = self._hidden_files.pop()\n'
            '        print(f"un-hiding {filename}")\n'
            '\n'
            '\n'
            'class DeleteFileCommand:\n'
            '    _deleted_files: list[str] = []\n'
            '\n'
            '    def __init__(self) -> None:\n'
            '        pass\n'
            '\n'
            '    def execute(self, filename: str) -> None:\n'
            '        print(f"deleting {filename}")\n'
            '        self._deleted_files.append(filename)\n'
            '\n'
            '    def undo(self) -> None:\n'
            '        filename = self._deleted_files.pop()\n'
            '        print(f"restoring {filename}")\n'
            '\n'
            '\n'
            'class MenuItem:\n'
            '    def __init__(self, command) -> None:\n'
            '        self._command = command\n'
            '\n'
            '    def on_do_press(self, filename: str) -> None:\n'
            '        self._command.execute(filename)\n'
            '\n'
            '    def on_undo_press(self) -> None:\n'
            '        self._command.undo()\n'
            '\n'
            '\n'
            'def main():\n'
            '    item1 = MenuItem(DeleteFileCommand())\n'
            '    item1.on_do_press("file1.txt")\n'
            '    item1.on_undo_press()\n'
            '\n'
            '\n'
            'if __name__ == "__main__":\n'
            '    main()\n'
        ),
        "golden_bug": {
            "line_number": 20,
            "severity": "High",
            "bug_description": "Class variable vs. instance variable confusion: `_deleted_files = []` is declared at the class level in `DeleteFileCommand`. All instances of `DeleteFileCommand` share the same deletion history list, meaning an `undo()` on one menu item will pop files deleted by a completely different command instance.",
            "suggested_fix": "Initialize `self._deleted_files: list[str] = []` inside `DeleteFileCommand.__init__` instead of defining it as a class attribute."
        }
    },
    "decorator": {
        "buggy_code": (
            '"""\n'
            'The Decorator pattern is used to dynamically add a new feature to an object.\n'
            '"""\n'
            '\n'
            '\n'
            'class TextTag:\n'
            '    """Represents a base text tag"""\n'
            '\n'
            '    def __init__(self, text: str) -> None:\n'
            '        self._text = text\n'
            '\n'
            '    def render(self) -> str:\n'
            '        return self._text\n'
            '\n'
            '\n'
            'class BoldWrapper(TextTag):\n'
            '    """Wraps a tag in <b>"""\n'
            '\n'
            '    def __init__(self, wrapped: TextTag) -> None:\n'
            '        self._wrapped = wrapped\n'
            '\n'
            '    def render(self) -> str:\n'
            '        return f"<b>{self._wrapped._text}</b>"\n'
            '\n'
            '\n'
            'class ItalicWrapper(TextTag):\n'
            '    """Wraps a tag in <i>"""\n'
            '\n'
            '    def __init__(self, wrapped: TextTag) -> None:\n'
            '        self._wrapped = wrapped\n'
            '\n'
            '    def render(self) -> str:\n'
            '        return f"<i>{self._wrapped.render()}</i>"\n'
            '\n'
            '\n'
            'def main():\n'
            '    simple_hello = TextTag("hello, world!")\n'
            '    special_hello = BoldWrapper(ItalicWrapper(simple_hello))\n'
            '    print("rendered:", special_hello.render())\n'
            '\n'
            '\n'
            'if __name__ == "__main__":\n'
            '    main()\n'
        ),
        "golden_bug": {
            "line_number": 23,
            "severity": "High",
            "bug_description": "Breaking encapsulation and bypassing polymorphism: In `BoldWrapper.render`, accessing `self._wrapped._text` directly instead of calling `self._wrapped.render()` breaks the decorator chain. If `_wrapped` is itself a decorator (like `ItalicWrapper`), its formatting is completely bypassed and ignored.",
            "suggested_fix": "Call the polymorphic interface method `self._wrapped.render()`: `return f'<b>{self._wrapped.render()}</b>'`."
        }
    },
    "facade": {
        "buggy_code": (
            '"""\n'
            'Provides a simpler unified interface to a complex system.\n'
            '"""\n'
            '\n'
            '\n'
            'class CPU:\n'
            '    def freeze(self) -> None:\n'
            '        print("Freezing processor.")\n'
            '\n'
            '    def jump(self, position: str) -> None:\n'
            '        print("Jumping to:", position)\n'
            '\n'
            '    def execute(self) -> None:\n'
            '        print("Executing.")\n'
            '\n'
            '\n'
            'class Memory:\n'
            '    def load(self, position: str, data: str) -> None:\n'
            '        print(f"Loading from {position} data: \'{data}\'.")\n'
            '\n'
            '\n'
            'class SolidStateDrive:\n'
            '    def read(self, lba: str, size: str) -> str:\n'
            '        return f"Some data from sector {lba} with size {size}"\n'
            '\n'
            '\n'
            'class ComputerFacade:\n'
            '    def __init__(self):\n'
            '        self.cpu = CPU()\n'
            '        self.memory = Memory()\n'
            '        self.ssd = SolidStateDrive()\n'
            '\n'
            '    def start(self):\n'
            '        try:\n'
            '            self.cpu.freeze()\n'
            '            self.memory.load("0x00", self.ssd.read("100", "1024"))\n'
            '            self.cpu.jump("0x00")\n'
            '            self.cpu.execute()\n'
            '        except Exception:\n'
            '            pass\n'
            '\n'
            '\n'
            'def main():\n'
            '    computer_facade = ComputerFacade()\n'
            '    computer_facade.start()\n'
            '\n'
            '\n'
            'if __name__ == "__main__":\n'
            '    main()\n'
        ),
        "golden_bug": {
            "line_number": 37,
            "severity": "Critical",
            "bug_description": "Blanket exception swallowing: `ComputerFacade.start` wraps the entire subsystem boot sequence in a bare `except Exception: pass`. If memory fails to load or disk reads fail, the error is silently swallowed with no logging or escalation, giving callers the false impression that boot succeeded.",
            "suggested_fix": "Remove `except Exception: pass`, or log the error and re-raise a domain exception such as `raise SystemBootError('Subsystem failure during computer boot') from err`."
        }
    },
    "observer": {
        "buggy_code": (
            '"""\n'
            'Observer Pattern: Maintains a list of dependents and notifies them of state changes.\n'
            '"""\n'
            '\n'
            'from __future__ import annotations\n'
            '\n'
            '\n'
            'class Observer:\n'
            '    def update(self, subject: Subject) -> None:\n'
            '        pass\n'
            '\n'
            '\n'
            'class Subject:\n'
            '    _observers: list[Observer] = []\n'
            '\n'
            '    def __init__(self) -> None:\n'
            '        pass\n'
            '\n'
            '    def attach(self, observer: Observer) -> None:\n'
            '        if observer not in self._observers:\n'
            '            self._observers.append(observer)\n'
            '\n'
            '    def detach(self, observer: Observer) -> None:\n'
            '        try:\n'
            '            self._observers.remove(observer)\n'
            '        except ValueError:\n'
            '            pass\n'
            '\n'
            '    def notify(self) -> None:\n'
            '        for observer in self._observers:\n'
            '            observer.update(self)\n'
            '\n'
            '\n'
            'class Data(Subject):\n'
            '    def __init__(self, name: str = "") -> None:\n'
            '        super().__init__()\n'
            '        self.name = name\n'
            '        self._data = 0\n'
            '\n'
            '    @property\n'
            '    def data(self) -> int:\n'
            '        return self._data\n'
            '\n'
            '    @data.setter\n'
            '    def data(self, value: int) -> None:\n'
            '        self._data = value\n'
            '        self.notify()\n'
            '\n'
            '\n'
            'class DecimalViewer(Observer):\n'
            '    def update(self, subject: Data) -> None:\n'
            '        print(f"DecimalViewer: Subject {subject.name} has data {subject.data}")\n'
            '\n'
            '\n'
            'def main():\n'
            '    data1 = Data("Data 1")\n'
            '    data2 = Data("Data 2")\n'
            '    viewer = DecimalViewer()\n'
            '    data1.attach(viewer)\n'
            '    data2.data = 10\n'
            '\n'
            '\n'
            'if __name__ == "__main__":\n'
            '    main()\n'
        ),
        "golden_bug": {
            "line_number": 15,
            "severity": "Critical",
            "bug_description": "Class variable vs. instance variable confusion: `_observers = []` is defined as a class attribute on `Subject`. All `Subject` and `Data` instances share the exact same observer list. Subscribing to `data1` inadvertently causes updates on `data2` to notify `data1`'s observers.",
            "suggested_fix": "Initialize `self._observers: list[Observer] = []` inside `Subject.__init__` so each subject manages its own independent subscription list."
        }
    },
    "prototype": {
        "buggy_code": (
            '"""\n'
            'Prototype: Creates new object instances by cloning a prototype.\n'
            '"""\n'
            '\n'
            'from __future__ import annotations\n'
            'import copy\n'
            'from typing import Any\n'
            '\n'
            '\n'
            'class Prototype:\n'
            '    def __init__(self, value: str = "default", **attrs: Any) -> None:\n'
            '        self.value = value\n'
            '        self.__dict__.update(attrs)\n'
            '\n'
            '    def clone(self, **attrs: Any) -> Prototype:\n'
            '        """Clone a prototype and update inner attributes dictionary"""\n'
            '        obj = copy.copy(self)\n'
            '        obj.__dict__.update(attrs)\n'
            '        return obj\n'
            '\n'
            '\n'
            'class PrototypeDispatcher:\n'
            '    def __init__(self):\n'
            '        self._objects = {}\n'
            '\n'
            '    def get_objects(self) -> dict[str, Prototype]:\n'
            '        return self._objects\n'
            '\n'
            '    def register_object(self, name: str, obj: Prototype) -> None:\n'
            '        self._objects[name] = obj\n'
            '\n'
            '    def unregister_object(self, name: str) -> None:\n'
            '        del self._objects[name]\n'
            '\n'
            '\n'
            'def main() -> None:\n'
            '    prototype = Prototype(value="initial", config={"retries": 3})\n'
            '    cloned = prototype.clone(value="cloned")\n'
            '    cloned.config["retries"] = 5\n'
            '    print(prototype.config["retries"])\n'
            '\n'
            '\n'
            'if __name__ == "__main__":\n'
            '    main()\n'
        ),
        "golden_bug": {
            "line_number": 17,
            "severity": "High",
            "bug_description": "Shallow copy instead of deep copy: In `Prototype.clone`, `copy.copy(self)` produces a shallow copy. If the prototype contains nested mutable objects (e.g., config dicts or lists), the clone and the original share the same nested references. Modifying a nested value on the clone mutates the original prototype.",
            "suggested_fix": "Use `copy.deepcopy(self)` to guarantee that all nested mutable structures are completely cloned."
        }
    },
    "proxy": {
        "buggy_code": (
            '"""\n'
            'Proxy Pattern: Adds functionality or access control to a resource without changing its interface.\n'
            '"""\n'
            '\n'
            '\n'
            'class Subject:\n'
            '    def do_the_job(self, user: str) -> None:\n'
            '        raise NotImplementedError()\n'
            '\n'
            '\n'
            'class RealSubject(Subject):\n'
            '    def do_the_job(self, user: str) -> None:\n'
            '        print(f"I am doing the job for {user}")\n'
            '\n'
            '\n'
            'class Proxy(Subject):\n'
            '    def __init__(self) -> None:\n'
            '        self._real_subject = RealSubject()\n'
            '\n'
            '    def do_the_job(self, user: str) -> None:\n'
            '        print(f"[log] Doing the job for {user} is requested.")\n'
            '        try:\n'
            '            if user == "admin":\n'
            '                self._real_subject.do_the_job(user)\n'
            '            else:\n'
            '                raise PermissionError("Access denied: only admins are permitted.")\n'
            '        except PermissionError:\n'
            '            pass\n'
            '\n'
            '\n'
            'def client(job_doer: Subject, user: str) -> None:\n'
            '    job_doer.do_the_job(user)\n'
            '\n'
            '\n'
            'def main():\n'
            '    proxy = Proxy()\n'
            '    client(proxy, "anonymous")\n'
            '\n'
            '\n'
            'if __name__ == "__main__":\n'
            '    main()\n'
        ),
        "golden_bug": {
            "line_number": 27,
            "severity": "Critical",
            "bug_description": "Exception swallowing on authorization failure: The `except PermissionError: pass` block silently suppresses security denials. The caller receives no exception, warning, or return status, giving the false illusion that the job was authorized and executed.",
            "suggested_fix": "Remove the `except PermissionError: pass` block and allow `PermissionError` to propagate to the caller (or convert it into an explicit HTTP 403 Forbidden exception)."
        }
    },
    "strategy": {
        "buggy_code": (
            '"""\n'
            'Enables selecting an algorithm at runtime.\n'
            '"""\n'
            '\n'
            'from __future__ import annotations\n'
            'from collections.abc import Callable\n'
            'from typing import TypeAlias\n'
            '\n'
            'DiscountStrategy: TypeAlias = Callable[["Order"], float]\n'
            '\n'
            '\n'
            'class Order:\n'
            '    def __init__(self, price: float, discount_strategy: DiscountStrategy | None = None) -> None:\n'
            '        self.price: float = price\n'
            '        self.discount_strategy = discount_strategy\n'
            '\n'
            '    def apply_discount(self) -> float:\n'
            '        try:\n'
            '            if self.discount_strategy:\n'
            '                discount = self.discount_strategy(self)\n'
            '            else:\n'
            '                discount = 0.0\n'
            '            return self.price - discount\n'
            '        except Exception:\n'
            '            return 0.0\n'
            '\n'
            '\n'
            'def broken_strategy(order: Order) -> float:\n'
            '    raise KeyError("Strategy configuration missing")\n'
            '\n'
            '\n'
            'def main():\n'
            '    order = Order(100.0, discount_strategy=broken_strategy)\n'
            '    print("Final price:", order.apply_discount())\n'
            '\n'
            '\n'
            'if __name__ == "__main__":\n'
            '    main()\n'
        ),
        "golden_bug": {
            "line_number": 24,
            "severity": "Critical",
            "bug_description": "Dangerous fallback and exception swallowing: In `Order.apply_discount`, catching `except Exception:` and returning `0.0` gives away the order for free ($0.0) whenever a strategy crashes. Business-critical calculation errors should never default to a 100% discount.",
            "suggested_fix": "Remove `except Exception: return 0.0` and allow calculation errors to propagate, or log the failure and fall back safely to `return self.price` (zero discount) while alerting operations."
        }
    }
}


def main():
    print("=" * 65)
    print("Injecting Level 2 Software Engineering / OOP Golden Bugs")
    print("=" * 65)

    if not BASE_DIR.exists():
        raise FileNotFoundError(f"Directory not found: {BASE_DIR}")

    success_count = 0

    for pattern_name, data in EXERCISES_DATA.items():
        pat_dir = BASE_DIR / pattern_name
        if not pat_dir.exists():
            print(f"[!] Warning: Directory {pat_dir} does not exist, creating it.")
            pat_dir.mkdir(parents=True, exist_ok=True)

        buggy_code = data["buggy_code"]
        golden_bug = data["golden_bug"]

        # 1. Validate syntax with AST
        try:
            ast.parse(buggy_code)
        except SyntaxError as e:
            print(f"[X] Syntax error in {pattern_name}: {e}")
            continue

        # 2. Write buggy.py
        buggy_path = pat_dir / "buggy.py"
        buggy_path.write_text(buggy_code, encoding="utf-8")

        # 3. Write golden_bug.json
        golden_path = pat_dir / "golden_bug.json"
        golden_path.write_text(json.dumps(golden_bug, indent=2, ensure_ascii=False), encoding="utf-8")

        success_count += 1
        print(f"[{success_count:02d}/10] {pattern_name:18} -> Line {golden_bug['line_number']:2d} [{golden_bug['severity']:8}]")

    print("=" * 65)
    print(f"Successfully processed {success_count}/10 Level 2 exercises.")
    print("=" * 65)


if __name__ == "__main__":
    main()
