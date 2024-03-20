#include <iostream>
#include <fstream>
#include <string>
#include <sstream>

using namespace std;

// magick INPUT.JPG -compress none OUTPUT.PPM

// Function to invert the colors of the image
void invertColors(const string &inputFileName, const string &outputFileName) {
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
    int r, g, b;
    while (inputFile >> r >> g >> b) {
        // Invert colors
        r = maxColorValue - r;
        g = maxColorValue - g;
        b = maxColorValue - b;

        // Output inverted colors
        outputFile << r << " " << g << " " << b << " ";
    }

    inputFile.close();
    outputFile.close();
    cout << "Image inversion completed." << endl;
}

int main(int argc, char* argv[]) {
    if (argc != 3) {
        cerr << "Usage: " << argv[0] << " <input_file.ppm> <output_file.ppm>" << endl;
        return 1;
    }

    string inputFileName = argv[1];
    string outputFileName = argv[2];

    invertColors(inputFileName, outputFileName);

    return 0;
}
