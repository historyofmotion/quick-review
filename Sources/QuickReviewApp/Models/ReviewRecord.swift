import Foundation

public struct ReviewRecord: Identifiable, Codable, Equatable, Hashable {
    public var id: UUID
    public var title: String
    public var recordDescription: String
    public var tags: [String]
    public var imageFileName: String?
    public var createdAt: Date
    public var modifiedAt: Date
    public var sortOrder: Int

    public init(
        id: UUID = UUID(),
        title: String,
        recordDescription: String = "",
        tags: [String] = [],
        imageFileName: String? = nil,
        createdAt: Date = Date(),
        modifiedAt: Date = Date(),
        sortOrder: Int = 0
    ) {
        self.id = id
        self.title = title
        self.recordDescription = recordDescription
        self.tags = tags
        self.imageFileName = imageFileName
        self.createdAt = createdAt
        self.modifiedAt = modifiedAt
        self.sortOrder = sortOrder
    }
}
