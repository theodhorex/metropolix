import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import kit
kit.reset()
kit.box(0, 0, 0, 1, 1, 0.02, kit.mat('#7a9a50'), 'tile')
kit.box(0.4, 0, 0, 0.2, 0.2, 0.5, kit.mat('#d03030'), 'xred')
kit.box(0, 0.4, 0, 0.2, 0.2, 0.3, kit.mat('#3050d0'), 'yblue')
kit.render(sys.argv[-1])
