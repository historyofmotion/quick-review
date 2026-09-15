import Foundation

public enum SortOption: String, CaseIterable, Identifiable, Codable {
    case entryOrder = "Entry Order"
    case dateCreatedDesc = "Newest First"
    case dateCreatedAsc = "Oldest First"
    case dateModifiedDesc = "Recently Modified"
    case titleAsc = "Title (A-Z)"
    case titleDesc = "Title (Z-A)"

    public var id: String { rawValue }

    public func sortRecords(_ records: [ReviewRecord]) -> [ReviewRecord] {
        switch self {
        case .entryOrder:
            return records.sorted { $0.sortOrder < $1.sortOrder }
        case .dateCreatedDesc:
            return records.sorted { $0.createdAt > $1.createdAt }
        case .dateCreatedAsc:
            return records.sorted { $0.createdAt < $1.createdAt }
        case .dateModifiedDesc:
            return records.sorted { $0.modifiedAt > $1.modifiedAt }
        case .titleAsc:
            return records.sorted { $0.title.localizedCaseInsensitiveCompare($1.title) == .orderedAscending }
        case .titleDesc:
            return records.sorted { $0.title.localizedCaseInsensitiveCompare($1.title) == .orderedDescending }
        }
    }
}
