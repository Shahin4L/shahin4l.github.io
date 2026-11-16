from pathlib import Path
import shutil
root=Path(__file__).resolve().parents[1]
out=root/'_site'
if out.exists():shutil.rmtree(out)
out.mkdir()
for path in root.iterdir():
 if path.is_file() and (path.suffix in ['.html','.jpg','.png','.pdf','.txt','.csv','.xml'] or path.name=='robots.txt'):shutil.copy2(path,out/path.name)
for folder in ['blog','admin','css','js','assets','formula-lab']:
 shutil.copytree(root/folder,out/folder)
(out/'.nojekyll').touch()
print('Packaged public website into _site.')
