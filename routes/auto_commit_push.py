import os
import subprocess
import time
from datetime import datetime

# Path to your local git repository (replace with the actual local path)
# Replace with your local repo path
repo_path = r"C:\Users\Asus\Desktop\pg_backend\routes"
file_to_modify = os.path.join(repo_path, "auto_update.txt")  # File to modify


def modify_file():
    """Function to modify the file by appending a timestamp."""
    with open(file_to_modify, "a") as f:
        f.write(f"Updated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")


def git_commit_and_push():
    """Function to stage, commit, and push changes to GitHub."""
    commit_message = f"Code commit on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    try:
        # Change to the repo directory
        os.chdir(repo_path)

        # Stage all changes
        subprocess.run(["git", "add", "."], check=True)

        # Commit the changes
        subprocess.run(["git", "commit", "-m", commit_message], check=True)

        # Push to the main branch
        subprocess.run(["git", "push", "origin", "main"], check=True)

        print("Changes committed and pushed successfully.")

    except subprocess.CalledProcessError as e:
        print(f"An error occurred: {e}")


# Loop to automatically modify, commit, and push every few seconds
while True:
    modify_file()           # Modify the file with a new update
    git_commit_and_push()    # Commit and push the modification
    # Wait before the next modification; adjust interval as needed
    time.sleep(300)


# python auto_commit_push.py
