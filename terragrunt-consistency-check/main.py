import difflib
import os

envs = ['dev', 'uat', 'prd']
def get_paths(directories):
    file_paths = {}
    for directory in directories:
        terragrunt_dir = os.path.join(os.environ['GITHUB_WORKSPACE'], 'terragrunt', directory)
        for root, dirs, files in os.walk(terragrunt_dir):
            for filename in files:
                if filename.endswith(".hcl"):
                    parent_dir = root.split("/")[-1]
                    if parent_dir not in file_paths:
                        file_paths[parent_dir] = []

                    file_paths[parent_dir].append(os.path.join(root, filename))


    return file_paths

def read_file(path):
    with open(path, 'r') as file:
        return file.readlines()

for key, file_paths in get_paths(envs).items():
    if len(file_paths) < len(envs):
        print("::warning ::Missing .hcl files found in the terragrunt directories.")
    file_contents = [read_file(p) for p in file_paths]

    for i in range(len(file_contents) - 1):
        for j in range(i + 1, len(file_contents)):
            file1_path = file_paths[i]
            file2_path = file_paths[j]
            file1_content = file_contents[i]
            file2_content = file_contents[j]


            diff = difflib.unified_diff(
                file1_content,
                file2_content,
                fromfile=file1_path,
                tofile=file2_path,
                lineterm=''
            )


            print(f"Comparing {file1_path} and {file2_path}")
            for line in diff:
                if line.startswith('-'):
                    print('::warning ::Diff detected' + '\033[91m' + line + '\033[0m')
                elif line.startswith('+'):
                    print('::warning ::Diff detected' + '\033[92m' + line + '\033[0m')
                else:
                    print(line)

