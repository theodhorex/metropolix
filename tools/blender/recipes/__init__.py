# Building recipes: fn(S, rng) builds one kind with style S (see style.py). Each category file exports
# RECIPES = {kind: fn}. A style's `overrides` replace a recipe for that people only.
import importlib

# wonders belong to one people each (sim BUILDINGS[kind].arc)
WONDER_ARC = {'moontree': 'elf', 'suntemple': 'lizard', 'stones': 'caveman', 'emberthrone': 'dragon', 'scrapspire': 'goblin'}

MODULES = ('residential', 'commerce', 'industry', 'services', 'military', 'decoration', 'wonders', 'wonders_goblin', 'wonders_extra')


def all_recipes(reload=False):
    out = {}
    for name in MODULES:
        try:
            mod = importlib.import_module(f'recipes.{name}')
        except ModuleNotFoundError as e:
            if e.name == f'recipes.{name}':
                continue
            raise
        if reload:
            mod = importlib.reload(mod)
        out.update(getattr(mod, 'RECIPES', {}))
    return out
