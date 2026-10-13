import adsk.core, adsk.fusion, os, re, json

def run(_context: str):
    app = adsk.core.Application.get()
    design = adsk.fusion.Design.cast(app.activeProduct)
    root = design.rootComponent
    out = '{{OUT}}'
    os.makedirs(out, exist_ok=True)
    em = design.exportManager
    bodies = [b for b in root.bRepBodies] + [b for occ in root.allOccurrences if occ.isLightBulbOn for b in occ.bRepBodies]
    n = 0
    placed = {}
    for b in bodies:
        if not b.isVisible:
            continue
        safe = re.sub(r'[^A-Za-z0-9]+', '_', b.name)[:40]
        path = os.path.join(out, f'{n:03d}_{safe}.stl')
        opts = em.createSTLExportOptions(b, path)
        opts.isBinaryFormat = True
        opts.meshRefinement = adsk.fusion.MeshRefinementSettings.{{REF}}
        opts.sendToPrintUtility = False
        em.execute(opts)
        # STL export of a body inside a sub-component is written in that component's own
        # coordinates: keep the occurrence's place in the assembly (Fusion API units: cm)
        if b.assemblyContext:
            placed[os.path.basename(path)] = list(b.assemblyContext.transform2.asArray())
        n += 1
    with open(os.path.join(out, 'transforms.json'), 'w') as f:
        json.dump(placed, f)
    print('exported', n, 'visible bodies,', len(placed), 'placed in an assembly')
