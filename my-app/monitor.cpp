#include <iostream>
#include <filesystem>
#include <unordered_set>
#include <string>
#include <thread>
#include <chrono>
#include <cstdlib>     // for std::system
#include <algorithm>   // for std::transform

namespace fs = std::filesystem;

int main()
{
    std::string folder_to_monitor = "./data";

    // Check if folder_to_monitor exists
    if (!fs::exists(folder_to_monitor)) {
        std::cerr << "Error: The folder '" << folder_to_monitor << "' does not exist.\n";
        return 1;
    }

    // We will store the full paths of files we've already seen.
    std::unordered_set<std::string> known_files;

    // Initial scan to populate known_files
    for (auto& p: fs::recursive_directory_iterator(folder_to_monitor)) {
        if (p.is_regular_file()) {
            known_files.insert(p.path().string());
        }
    }

    std::cout << "Starting to monitor: " << folder_to_monitor << " (and all subfolders)..." << std::endl;

    try {
        while (true) {
            std::cout << "Monitoring is active..." << std::endl;

            // Scan directory for new files
            for (auto& p: fs::recursive_directory_iterator(folder_to_monitor)) {
                if (!p.is_regular_file()) {
                    continue; // skip directories
                }

                std::string file_path = p.path().string();
                
                // Check if we've seen this file before
                if (known_files.find(file_path) == known_files.end()) {
                    // It's a new file
                    known_files.insert(file_path);

                    // Extract filename only (e.g., "audio123.wav")
                    std::string filename = p.path().filename().string();
                    std::cout << "New file detected: " << file_path << std::endl;

                    // Convert the filename to lowercase if you want a case-insensitive check
                    // or you can just check the prefix as is.
                    std::string prefix = filename.substr(0, 5); // "audio" or "video" are 5 letters
                    // You may want to check length first to avoid out_of_range if filename is short
                    if (filename.size() >= 5) {
                        // Convert to lowercase for a robust check
                        std::transform(prefix.begin(), prefix.end(), prefix.begin(), ::tolower);

                        if (prefix == "audio") {
                            std::cout << "Triggering audio processing for: " << file_path << std::endl;
                            // Example command: python audio.py <file_path>
                            // Make sure the path to Python is correct on your system
                            std::string command = "python audio.py \"" + file_path + "\"";
                            std::system(command.c_str());
                        }
                        else if (prefix == "video") {
                            std::cout << "Triggering video processing for: " << file_path << std::endl;
                            // Example command: python video.py <file_path>
                            std::string command = "python video_jit.py \"" + file_path + "\"";
                            std::system(command.c_str());
                        }
                        else {
                            std::cout << "Unsupported or misclassified file: " << file_path << std::endl;
                        }
                    }
                    else {
                        // Filename is shorter than 5 chars
                        std::cout << "Unsupported or misclassified file: " << file_path << std::endl;
                    }
                }
            }

            // Sleep for 10 seconds
            std::this_thread::sleep_for(std::chrono::seconds(10));
        }
    }
    catch (std::exception &e) {
        std::cerr << "Error occurred: " << e.what() << std::endl;
        return 1;
    }
    return 0;
}
