import Foundation
import AppKit

public final class StorageService: @unchecked Sendable {
    public static let shared = StorageService()

    public let rootDirectory: URL
    public let setsDirectory: URL
    public let settingsFile: URL

    private let fileManager = FileManager.default
    private let jsonEncoder: JSONEncoder
    private let jsonDecoder: JSONDecoder

    public init(customRootURL: URL? = nil) {
        let documentsURL = fileManager.urls(for: .documentDirectory, in: .userDomainMask).first!
        let root = customRootURL ?? documentsURL.appendingPathComponent("Quick Review", isDirectory: true)
        self.rootDirectory = root
        self.setsDirectory = root.appendingPathComponent("Sets", isDirectory: true)
        self.settingsFile = root.appendingPathComponent("settings.json", isDirectory: false)

        let encoder = JSONEncoder()
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        encoder.dateEncodingStrategy = .iso8601
        self.jsonEncoder = encoder

        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        self.jsonDecoder = decoder

        createDirectoryStructureIfNeeded()
    }

    public func createDirectoryStructureIfNeeded() {
        do {
            if !fileManager.fileExists(atPath: setsDirectory.path) {
                try fileManager.createDirectory(at: setsDirectory, withIntermediateDirectories: true, attributes: nil)
            }
        } catch {
            print("Failed to create sets directory: \(error)")
        }
    }

    // MARK: - Sets Storage

    public func loadAllSets() -> [ReviewSet] {
        createDirectoryStructureIfNeeded()

        var loadedSets: [ReviewSet] = []

        guard let enumerator = fileManager.enumerator(at: setsDirectory, includingPropertiesForKeys: [.isDirectoryKey], options: [.skipsSubdirectoryDescendants, .skipsHiddenFiles]) else {
            return loadedSets
        }

        for case let folderURL as URL in enumerator {
            var isDir: ObjCBool = false
            if fileManager.fileExists(atPath: folderURL.path, isDirectory: &isDir), isDir.boolValue {
                let setJsonURL = folderURL.appendingPathComponent("set.json")
                if fileManager.fileExists(atPath: setJsonURL.path) {
                    do {
                        let data = try Data(contentsOf: setJsonURL)
                        var reviewSet = try jsonDecoder.decode(ReviewSet.self, from: data)
                        // Make sure folderName matches actual directory name
                        reviewSet.folderName = folderURL.lastPathComponent
                        loadedSets.append(reviewSet)
                    } catch {
                        print("Failed to decode set at \(setJsonURL): \(error)")
                    }
                }
            }
        }

        // If no sets exist yet, create a default sample set
        if loadedSets.isEmpty {
            let defaultSet = createDefaultSet()
            saveSet(defaultSet)
            loadedSets.append(defaultSet)
        }

        return loadedSets.sorted { $0.createdAt < $1.createdAt }
    }

    public func saveSet(_ reviewSet: ReviewSet) {
        let setDir = setDirectoryURL(for: reviewSet)
        let imagesDir = imagesDirectoryURL(for: reviewSet)

        do {
            if !fileManager.fileExists(atPath: imagesDir.path) {
                try fileManager.createDirectory(at: imagesDir, withIntermediateDirectories: true, attributes: nil)
            }

            let setJsonURL = setDir.appendingPathComponent("set.json")
            let data = try jsonEncoder.encode(reviewSet)
            try data.write(to: setJsonURL, options: .atomic)
        } catch {
            print("Failed to save review set \(reviewSet.name): \(error)")
        }
    }

    public func deleteSet(_ reviewSet: ReviewSet) {
        let setDir = setDirectoryURL(for: reviewSet)
        if fileManager.fileExists(atPath: setDir.path) {
            do {
                try fileManager.removeItem(at: setDir)
            } catch {
                print("Failed to delete set folder at \(setDir): \(error)")
            }
        }
    }

    public func renameSetFolder(oldSet: ReviewSet, newName: String) -> String {
        let newFolderName = ReviewSet.sanitizeFolderName(newName)
        let oldDir = setDirectoryURL(for: oldSet)
        let newDir = setsDirectory.appendingPathComponent(newFolderName, isDirectory: true)

        if oldDir.path != newDir.path && fileManager.fileExists(atPath: oldDir.path) {
            do {
                try fileManager.moveItem(at: oldDir, to: newDir)
            } catch {
                print("Failed to rename set directory: \(error)")
                return oldSet.folderName
            }
        }
        return newFolderName
    }

    // MARK: - Images Management

    public func setDirectoryURL(for reviewSet: ReviewSet) -> URL {
        return setsDirectory.appendingPathComponent(reviewSet.folderName, isDirectory: true)
    }

    public func imagesDirectoryURL(for reviewSet: ReviewSet) -> URL {
        return setDirectoryURL(for: reviewSet).appendingPathComponent("images", isDirectory: true)
    }

    public func imageURL(fileName: String, for reviewSet: ReviewSet) -> URL {
        return imagesDirectoryURL(for: reviewSet).appendingPathComponent(fileName)
    }

    public func saveImageData(_ data: Data, for reviewSet: ReviewSet, preferredExtension: String = "png") -> String? {
        let imagesDir = imagesDirectoryURL(for: reviewSet)
        do {
            if !fileManager.fileExists(atPath: imagesDir.path) {
                try fileManager.createDirectory(at: imagesDir, withIntermediateDirectories: true, attributes: nil)
            }

            let fileName = "\(UUID().uuidString).\(preferredExtension)"
            let targetURL = imagesDir.appendingPathComponent(fileName)
            try data.write(to: targetURL, options: .atomic)
            return fileName
        } catch {
            print("Failed to save image data: \(error)")
            return nil
        }
    }

    public func deleteImage(fileName: String, for reviewSet: ReviewSet) {
        let targetURL = imageURL(fileName: fileName, for: reviewSet)
        if fileManager.fileExists(atPath: targetURL.path) {
            try? fileManager.removeItem(at: targetURL)
        }
    }

    public func loadImage(fileName: String, for reviewSet: ReviewSet) -> NSImage? {
        let targetURL = imageURL(fileName: fileName, for: reviewSet)
        guard fileManager.fileExists(atPath: targetURL.path) else { return nil }
        return NSImage(contentsOf: targetURL)
    }

    // MARK: - App Settings

    public func loadSettings() -> AppSettings {
        guard fileManager.fileExists(atPath: settingsFile.path) else {
            return AppSettings()
        }
        do {
            let data = try Data(contentsOf: settingsFile)
            return try jsonDecoder.decode(AppSettings.self, from: data)
        } catch {
            print("Failed to load settings: \(error)")
            return AppSettings()
        }
    }

    public func saveSettings(_ settings: AppSettings) {
        do {
            let data = try jsonEncoder.encode(settings)
            try data.write(to: settingsFile, options: .atomic)
        } catch {
            print("Failed to save settings: \(error)")
        }
    }

    // MARK: - Finder Integration

    public func revealInFinder(url: URL) {
        NSWorkspace.shared.activateFileViewerSelecting([url])
    }

    public func revealSetInFinder(_ reviewSet: ReviewSet) {
        let dir = setDirectoryURL(for: reviewSet)
        revealInFinder(url: dir)
    }

    public func revealRootInFinder() {
        revealInFinder(url: rootDirectory)
    }

    // MARK: - Default Seed Data

    private func createDefaultSet() -> ReviewSet {
        let sample1 = ReviewRecord(
            title: "Welcome to Quick Review",
            recordDescription: "Quick Review is your fast, distraction-free desktop app for creating, organizing, and reviewing sets of records.\n\n• Use ⌘N to quickly add new records\n• Paste images directly from your clipboard with ⌘V\n• Press ⌘Return or click 'Full Review' to enter focus review mode\n• Navigate seamlessly using the Left and Right arrow keys or J/K\n• Everything is automatically saved to ~/Documents/Quick Review/",
            tags: ["Tutorial", "Getting Started"],
            sortOrder: 0
        )

        let sample2 = ReviewRecord(
            title: "Keyboard Shortcuts Guide",
            recordDescription: "Speed up your workflow with native macOS keyboard shortcuts:\n\n• ⌘N: Add New Record\n• ⌘⇧N: Create New Review Set\n• ⌘F: Search & Filter current set\n• ⌘Return: Enter Full Review Mode\n• Left/Right Arrows or J/K: Navigate records in review\n• Esc: Exit full review mode\n• ⌘E: Edit selected record\n• ⌘Delete: Delete selected record",
            tags: ["Shortcuts", "Tips"],
            sortOrder: 1
        )

        let sample3 = ReviewRecord(
            title: "Finder-Accessible & Auto-Saved",
            recordDescription: "All your data is stored in human-readable JSON files and standard image files in:\n~/Documents/Quick Review/Sets/\n\nYou can inspect, copy, or back up your sets directly through Finder anytime!",
            tags: ["Storage", "Finder"],
            sortOrder: 2
        )

        return ReviewSet(
            name: "Getting Started",
            folderName: "Getting_Started",
            records: [sample1, sample2, sample3]
        )
    }
}
