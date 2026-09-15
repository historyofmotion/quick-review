import Foundation

public struct AppSettings: Codable, Equatable {
    public var lastSelectedSetId: UUID?
    public var sortOption: SortOption
    public var isSidebarVisible: Bool

    public init(
        lastSelectedSetId: UUID? = nil,
        sortOption: SortOption = .entryOrder,
        isSidebarVisible: Bool = true
    ) {
        self.lastSelectedSetId = lastSelectedSetId
        self.sortOption = sortOption
        self.isSidebarVisible = isSidebarVisible
    }
}
