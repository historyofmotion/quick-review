import Foundation

public struct ReviewSet: Identifiable, Codable, Equatable, Hashable {
    public var id: UUID
    public var name: String
    public var folderName: String
    public var records: [ReviewRecord]
    public var createdAt: Date
    public var modifiedAt: Date

    public init(
        id: UUID = UUID(),
        name: String,
        folderName: String? = nil,
        records: [ReviewRecord] = [],
        createdAt: Date = Date(),
        modifiedAt: Date = Date()
    ) {
        self.id = id
        self.name = name
        self.folderName = folderName ?? ReviewSet.sanitizeFolderName(name)
        self.records = records
        self.createdAt = createdAt
        self.modifiedAt = modifiedAt
    }

    public static func sanitizeFolderName(_ name: String) -> String {
        let invalidCharacters = CharacterSet(charactersIn: "\\/:*?\"<>|")
        let sanitized = name.components(separatedBy: invalidCharacters).joined(separator: "_")
        let trimmed = sanitized.trimmingCharacters(in: .whitespacesAndNewlines)
        return trimmed.isEmpty ? "Set_\(UUID().uuidString.prefix(8))" : trimmed
    }
}
