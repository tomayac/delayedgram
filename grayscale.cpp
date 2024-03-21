#include <iostream>
#include <fstream>
#include <string>
#include <sstream>

using namespace std;

// Function to convert the image to grayscale
void convertToGrayscale(const string &inputFileName, const string &outputFileName) {
    ifstream inputFile(inputFileName);
    ofstream outputFile(outputFileName);

    if (!inputFile.is_open()) {
        cerr << "Could not open the input file." << endl;
        return;
    }

    if (!outputFile.is_open()) {
        cerr << "Could not create the output file." << endl;
        return;
    }

    string line;
    // Read the magic number
    getline(inputFile, line);
    outputFile << line << endl;

    // Skip comments
    while (getline(inputFile, line)) {
        if (line[0] == '#') {
            outputFile << line << endl;
        } else {
            break;
        }
    }

    // The line now contains the dimensions, output it unchanged
    outputFile << line << endl;

    // Read and output the max color value
    getline(inputFile, line);
    outputFile << line << endl;
    int maxColorValue = stoi(line);

    // Process the image data
    int r, g, b, gray;
    while (inputFile >> r >> g >> b) {
        // Calculate the grayscale value
        gray = static_cast<int>(0.299 * r + 0.587 * g + 0.114 * b);

        // Output the grayscale value for each color component
        outputFile << gray << " " << gray << " " << gray << " ";
    }

    inputFile.close();
    outputFile.close();
}

int main(int argc, char* argv[]) {
    if (argc != 3) {
        cerr << "Usage: " << argv[0] << " <input_file.ppm> <output_file.ppm>" << endl;
        return 1;
    }

    string inputFileName = argv[1];
    string outputFileName = argv[2];

    convertToGrayscale(inputFileName, outputFileName);

    return 0;
}
