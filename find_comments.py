import os

def find_longest_comments(start_path):
    results = []
    for dirpath, dirnames, filenames in os.walk(start_path):
        if 'node_modules' in dirpath[len(start_path):].split(os.sep) or '.venv' in dirpath[len(start_path):].split(os.sep) or '.git' in dirpath:
            continue
        for filename in filenames:
            if not filename.endswith(('.js', '.jsx', '.py', '.ts', '.tsx')):
                continue
            filepath = os.path.join(dirpath, filename)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
            except Exception:
                continue
            max_consecutive = 0
            current_consecutive = 0
            total_comments = 0
            for line in lines:
                l = line.strip()
                if l.startswith('//') or l.startswith('#') or l.startswith('/*') or l.startswith('*'):
                    current_consecutive += 1
                    total_comments += 1
                    max_consecutive = max(max_consecutive, current_consecutive)
                else:
                    current_consecutive = 0
            if max_consecutive > 3:
                results.append((filepath, max_consecutive, total_comments))
    
    results.sort(key=lambda x: x[1], reverse=True)
    for res in results[:10]:
        print(f"{res[1]} consecutive | {res[2]} total | {res[0]}")

find_longest_comments(r"c:\Users\kashish\OneDrive\Desktop\shadowmode")
