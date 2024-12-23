import time
import os
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import subprocess


class FileEventHandler(FileSystemEventHandler):
    def __init__(self, folder_to_monitor):
        self.folder_to_monitor = folder_to_monitor

    def on_created(self, event):
        # Trigger when a file or folder is created
        if event.is_directory:
            print(f"New folder detected: {event.src_path}")
        else:
            file_path = event.src_path
            print(f"New file detected: {file_path}")

            # Check file name prefix to determine the script to run
            if os.path.basename(file_path).startswith("audio"):
                print(f"Triggering audio processing for: {file_path}")
                subprocess.run(["python", "audio.py", file_path])
            elif os.path.basename(file_path).startswith("video"):
                print(f"Triggering video processing for: {file_path}")
                subprocess.run(["python", "video.py", file_path])
            else:
                print(f"Unsupported or misclassified file: {file_path}")


def main():
    folder_to_monitor = "./data"  # Set the folder to monitor as 'data'

    # Check if the folder exists
    if not os.path.exists(folder_to_monitor):
        print(f"Error: The folder '{folder_to_monitor}' does not exist.")
        return

    event_handler = FileEventHandler(folder_to_monitor)
    observer = Observer()
    observer.schedule(event_handler, folder_to_monitor, recursive=True)

    print(f"Starting to monitor: {folder_to_monitor} (and all subfolders)...")
    observer.start()

    try:
        while True:
            # Add heartbeat logging
            print("Monitoring is active...")
            time.sleep(10)  # Log every 10 seconds
    except KeyboardInterrupt:
        print("Stopping the monitoring process...")
        observer.stop()
    except Exception as e:
        print(f"Error occurred: {e}")
    finally:
        observer.join()


if __name__ == "__main__":
    main()
