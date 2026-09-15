import Foundation
import AppKit

public struct ExportService {
    public static func exportSetToDirectory(set: ReviewSet, storage: StorageService, targetDirectory: URL) throws {
        let fileManager = FileManager.default
        let exportDir = targetDirectory.appendingPathComponent(set.name, isDirectory: true)

        if !fileManager.fileExists(atPath: exportDir.path) {
            try fileManager.createDirectory(at: exportDir, withIntermediateDirectories: true, attributes: nil)
        }

        // 1. Export Markdown Summary
        let markdownContent = generateMarkdownSummary(for: set)
        let mdURL = exportDir.appendingPathComponent("\(set.name).md")
        try markdownContent.write(to: mdURL, atomically: true, encoding: .utf8)

        // 2. Export JSON backup
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        encoder.dateEncodingStrategy = .iso8601
        let jsonData = try encoder.encode(set)
        let jsonURL = exportDir.appendingPathComponent("set.json")
        try jsonData.write(to: jsonURL, options: .atomic)

        // 3. Copy Images
        let sourceImagesDir = storage.imagesDirectoryURL(for: set)
        let targetImagesDir = exportDir.appendingPathComponent("images", isDirectory: true)

        if fileManager.fileExists(atPath: sourceImagesDir.path) {
            if !fileManager.fileExists(atPath: targetImagesDir.path) {
                try fileManager.createDirectory(at: targetImagesDir, withIntermediateDirectories: true, attributes: nil)
            }

            for record in set.records {
                if let imgName = record.imageFileName {
                    let src = sourceImagesDir.appendingPathComponent(imgName)
                    let dst = targetImagesDir.appendingPathComponent(imgName)
                    if fileManager.fileExists(atPath: src.path) && !fileManager.fileExists(atPath: dst.path) {
                        try? fileManager.copyItem(at: src, to: dst)
                    }
                }
            }
        }
    }

    public static func generateMarkdownSummary(for set: ReviewSet) -> String {
        var lines: [String] = []
        lines.append("# \(set.name)")
        lines.append("")
        lines.append("Created: \(formatDate(set.createdAt)) | Last Modified: \(formatDate(set.modifiedAt))")
        lines.append("Total Records: \(set.records.count)")
        lines.append("")
        lines.append("---")
        lines.append("")

        for (index, record) in set.records.enumerated() {
            lines.append("## \(index + 1). \(record.title)")
            if !record.tags.isEmpty {
                lines.append("**Tags**: " + record.tags.map { "`\($0)`" }.joined(separator: ", "))
                lines.append("")
            }
            lines.append("**Created**: \(formatDate(record.createdAt)) | **Modified**: \(formatDate(record.modifiedAt))")
            lines.append("")

            if let img = record.imageFileName {
                lines.append("![Image](images/\(img))")
                lines.append("")
            }

            if !record.recordDescription.isEmpty {
                lines.append(record.recordDescription)
                lines.append("")
            }

            lines.append("---")
            lines.append("")
        }

        return lines.joined(separator: "\n")
    }

    private static func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
}
