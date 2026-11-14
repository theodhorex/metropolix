# Build and render Metropolix buildings.
#   headless: blender -b --factory-startup -P make.py -- <arc> [kind ...]   (no kinds = every recipe)
#   live (blender-mcp): import make; make.build('goblin', 'villa')
# Renders go to out/<arc>/<kind>.png (or <kind>_0..2.png when it moves) plus <kind>.blend and a contact
# sheet out/<arc>/_sheet.png. install.py copies them into the game.
import os
import sys
import random
import importlib

HERE = os.path.dirname(os.path.abspath(__file__))
if HERE not in sys.path:
    sys.path.insert(0, HERE)

import kit  # noqa: E402
import style  # noqa: E402
import recipes  # noqa: E402

ARCS = ('goblin', 'elf', 'lizard', 'caveman', 'dragon')


def load_style(arc, reload=False):
    mod = importlib.import_module(f'styles.{arc}')
    if reload:
        importlib.reload(kit)
        importlib.reload(style)
        mod = importlib.reload(mod)
    return mod.STYLE


def recipe_for(S, kind, reload=False):
    table = recipes.all_recipes(reload=reload)
    return S.overrides.get(kind) or table[kind]


def build(arc, kind, seed=7, reload=True, level=1):
    S = load_style(arc, reload=reload)
    fn = recipe_for(S, kind, reload=reload)
    kit.reset()
    rng = random.Random(f'{arc}/{kind}/{seed}')
    fn(S, rng)
    if level and level > 1:
        S.upgrade(level, rng)
    kit.outline_all()
    kit.pose(0)
    return S


def render(arc, kinds=None, save_blend=True, level=1):
    import bpy
    bpy.context.preferences.filepaths.save_version = 0  # no .blend1 backups
    out = os.path.join(HERE, 'out', arc)
    os.makedirs(out, exist_ok=True)
    S = load_style(arc, reload=True)
    table = recipes.all_recipes(reload=True)
    if not kinds:
        # every recipe, except the other peoples' wonders
        from recipes import WONDER_ARC
        kinds = sorted(k for k in set(table) | set(S.overrides) if WONDER_ARC.get(k, arc) == arc)
        if level and level > 1:
            from recipes import decoration, wonders
            decor_wonders = set(getattr(decoration, 'RECIPES', {})) | set(getattr(wonders, 'RECIPES', {}))
            for extra in ('wonders_goblin', 'wonders_extra'):
                try:
                    mod = importlib.import_module(f'recipes.{extra}')
                    decor_wonders |= set(getattr(mod, 'RECIPES', {}))
                except ModuleNotFoundError:
                    pass
            kinds = [k for k in kinds if k not in decor_wonders]
    done = {}
    for kind in kinds:
        name = f'{kind}@{level}' if level and level > 1 else kind
        try:
            build(arc, kind, reload=False, level=level)
            for old in os.listdir(out):
                if old == f'{name}.png' or (old.startswith(f'{name}_') and old[len(name) + 1:-4].isdigit()):
                    os.remove(os.path.join(out, old))
            if level and level > 1 and not kit._anims:
                kit.anim(lambda f, n: None)
            done[name] = kit.render_all(os.path.join(out, name))
            if save_blend:
                bpy.ops.wm.save_as_mainfile(filepath=os.path.join(out, f'{name}.blend'), copy=True)
            print(f'OK {arc}/{name} frames={done[name]}', flush=True)
        except Exception as e:  # keep going: one broken recipe must not stop the batch
            import traceback
            traceback.print_exc()
            print(f'FAIL {arc}/{name}: {e}', flush=True)
    return done


if __name__ == '__main__' and '--' in sys.argv:
    args = sys.argv[sys.argv.index('--') + 1:]
    level = 1
    clean_args = []
    i = 0
    while i < len(args):
        if args[i] == '--level' and i + 1 < len(args):
            level = int(args[i + 1])
            i += 2
        elif args[i].startswith('--level='):
            level = int(args[i].split('=', 1)[1])
            i += 1
        else:
            clean_args.append(args[i])
            i += 1
    render(clean_args[0], clean_args[1:] or None, level=level)
