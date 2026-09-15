import SwiftUI
import Combine

@Observable
public final class AppState {
    public var sets: [ReviewSet] = []
    public var selectedSetId: UUID?
    public var selectedRecordId: UUID?
    public var searchText: String = ""
    public var selectedTag: String? = nil
    public var sortOption: SortOption = .entryOrder

    // Full review mode
    public var isFullReviewActive: Bool = false
    public var fullReviewRecordIndex: Int = 0

    // Sheet / Modal states
    public var isQuickAddSheetPresented: Bool = false
    public var isEditRecordSheetPresented: Bool = false
    public var recordBeingEdited: ReviewRecord? = nil

    public var isNewSetSheetPresented: Bool = false
    public var isRenameSetSheetPresented: Bool = false
    public var setBeingRenamed: ReviewSet? = nil

    public var alertMessage: String?
    public var isAlertPresented: Bool = false

    public let storage: StorageService

    public init(storage: StorageService = .shared) {
        self.storage = storage
        loadInitialData()
    }

    public func loadInitialData() {
        self.sets = storage.loadAllSets()
        let settings = storage.loadSettings()
        self.sortOption = settings.sortOption

        if let lastId = settings.lastSelectedSetId, sets.contains(where: { $0.id == lastId }) {
            self.selectedSetId = lastId
        } else {
            self.selectedSetId = sets.first?.id
        }

        if let active = activeSet, let firstRecord = active.records.first {
            self.selectedRecordId = firstRecord.id
        }
    }

    public var activeSet: ReviewSet? {
        guard let id = selectedSetId else { return sets.first }
        return sets.first(where: { $0.id == id })
    }

    public var allTagsInActiveSet: [String] {
        guard let active = activeSet else { return [] }
        let tagsSet = Set(active.records.flatMap { $0.tags })
        return Array(tagsSet).sorted()
    }

    public var filteredAndSortedRecords: [ReviewRecord] {
        guard let active = activeSet else { return [] }

        var records = active.records

        // 1. Tag filter
        if let tag = selectedTag, !tag.isEmpty {
            records = records.filter { $0.tags.contains(tag) }
        }

        // 2. Search keyword filter
        let query = searchText.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        if !query.isEmpty {
            records = records.filter { record in
                record.title.localizedCaseInsensitiveContains(query) ||
                record.recordDescription.localizedCaseInsensitiveContains(query) ||
                record.tags.contains { $0.localizedCaseInsensitiveContains(query) }
            }
        }

        // 3. Sort
        return sortOption.sortRecords(records)
    }

    // MARK: - Review Set Operations

    public func createSet(name: String) {
        let trimmed = name.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }

        let newSet = ReviewSet(name: trimmed)
        storage.saveSet(newSet)
        sets.append(newSet)
        selectedSetId = newSet.id
        selectedRecordId = nil
        saveAppSettings()
    }

    public func renameSet(set: ReviewSet, newName: String) {
        let trimmed = newName.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty, let index = sets.firstIndex(where: { $0.id == set.id }) else { return }

        let newFolder = storage.renameSetFolder(oldSet: set, newName: trimmed)
        var updated = set
        updated.name = trimmed
        updated.folderName = newFolder
        updated.modifiedAt = Date()

        storage.saveSet(updated)
        sets[index] = updated
    }

    public func deleteSet(set: ReviewSet) {
        guard let index = sets.firstIndex(where: { $0.id == set.id }) else { return }

        storage.deleteSet(set)
        sets.remove(at: index)

        if selectedSetId == set.id {
            selectedSetId = sets.first?.id
            selectedRecordId = activeSet?.records.first?.id
        }
        saveAppSettings()
    }

    public func duplicateSet(set: ReviewSet) {
        var newSet = ReviewSet(
            name: "\(set.name) Copy",
            records: set.records.map { record in
                var copy = record
                copy.id = UUID()
                copy.createdAt = Date()
                copy.modifiedAt = Date()
                return copy
            }
        )

        // Copy over image files
        storage.saveSet(newSet)
        let srcImages = storage.imagesDirectoryURL(for: set)
        let dstImages = storage.imagesDirectoryURL(for: newSet)

        for record in set.records {
            if let img = record.imageFileName {
                let src = srcImages.appendingPathComponent(img)
                let dst = dstImages.appendingPathComponent(img)
                try? FileManager.default.copyItem(at: src, to: dst)
            }
        }

        sets.append(newSet)
        selectedSetId = newSet.id
    }

    // MARK: - Record Operations

    public func addRecord(title: String, description: String, tags: [String], imageData: Data?) {
        guard var active = activeSet, let setIndex = sets.firstIndex(where: { $0.id == active.id }) else { return }

        var imageFileName: String? = nil
        if let data = imageData {
            imageFileName = storage.saveImageData(data, for: active)
        }

        let nextSortOrder = (active.records.map(\.sortOrder).max() ?? -1) + 1
        let newRecord = ReviewRecord(
            title: title.trimmingCharacters(in: .whitespacesAndNewlines),
            recordDescription: description,
            tags: tags,
            imageFileName: imageFileName,
            createdAt: Date(),
            modifiedAt: Date(),
            sortOrder: nextSortOrder
        )

        active.records.append(newRecord)
        active.modifiedAt = Date()

        storage.saveSet(active)
        sets[setIndex] = active
        selectedRecordId = newRecord.id
    }

    public func updateRecord(
        recordId: UUID,
        title: String,
        description: String,
        tags: [String],
        newImageData: Data?,
        removeImage: Bool
    ) {
        guard var active = activeSet,
              let setIndex = sets.firstIndex(where: { $0.id == active.id }),
              let recordIndex = active.records.firstIndex(where: { $0.id == recordId }) else { return }

        var record = active.records[recordIndex]
        record.title = title.trimmingCharacters(in: .whitespacesAndNewlines)
        record.recordDescription = description
        record.tags = tags
        record.modifiedAt = Date()

        if removeImage, let oldImg = record.imageFileName {
            storage.deleteImage(fileName: oldImg, for: active)
            record.imageFileName = nil
        }

        if let data = newImageData {
            if let oldImg = record.imageFileName {
                storage.deleteImage(fileName: oldImg, for: active)
            }
            record.imageFileName = storage.saveImageData(data, for: active)
        }

        active.records[recordIndex] = record
        active.modifiedAt = Date()

        storage.saveSet(active)
        sets[setIndex] = active
    }

    public func deleteRecord(recordId: UUID) {
        guard var active = activeSet,
              let setIndex = sets.firstIndex(where: { $0.id == active.id }),
              let recordIndex = active.records.firstIndex(where: { $0.id == recordId }) else { return }

        let record = active.records[recordIndex]
        if let img = record.imageFileName {
            storage.deleteImage(fileName: img, for: active)
        }

        active.records.remove(at: recordIndex)
        active.modifiedAt = Date()

        storage.saveSet(active)
        sets[setIndex] = active

        if selectedRecordId == recordId {
            selectedRecordId = active.records.first?.id
        }
    }

    public func moveRecords(fromOffsets: IndexSet, toOffset: Int) {
        guard var active = activeSet, let setIndex = sets.firstIndex(where: { $0.id == active.id }) else { return }

        active.records.move(fromOffsets: fromOffsets, toOffset: toOffset)
        for (idx, _) in active.records.enumerated() {
            active.records[idx].sortOrder = idx
        }
        active.modifiedAt = Date()

        storage.saveSet(active)
        sets[setIndex] = active
    }

    // MARK: - Full Review Navigation

    public func startFullReview(startingAt recordId: UUID? = nil) {
        let currentList = filteredAndSortedRecords
        guard !currentList.isEmpty else { return }

        if let id = recordId ?? selectedRecordId,
           let index = currentList.firstIndex(where: { $0.id == id }) {
            fullReviewRecordIndex = index
        } else {
            fullReviewRecordIndex = 0
        }
        isFullReviewActive = true
    }

    public func nextReviewRecord() {
        let count = filteredAndSortedRecords.count
        guard count > 0 else { return }
        if fullReviewRecordIndex < count - 1 {
            fullReviewRecordIndex += 1
            selectedRecordId = filteredAndSortedRecords[fullReviewRecordIndex].id
        }
    }

    public func previousReviewRecord() {
        guard fullReviewRecordIndex > 0 else { return }
        fullReviewRecordIndex -= 1
        selectedRecordId = filteredAndSortedRecords[fullReviewRecordIndex].id
    }

    public func exitFullReview() {
        isFullReviewActive = false
    }

    // MARK: - Settings

    public func setSortOption(_ option: SortOption) {
        self.sortOption = option
        saveAppSettings()
    }

    public func saveAppSettings() {
        let settings = AppSettings(
            lastSelectedSetId: selectedSetId,
            sortOption: sortOption,
            isSidebarVisible: true
        )
        storage.saveSettings(settings)
    }

    // MARK: - Export

    public func exportCurrentSet() {
        guard let active = activeSet else { return }

        let panel = NSOpenPanel()
        panel.canChooseFiles = false
        panel.canChooseDirectories = true
        panel.canCreateDirectories = true
        panel.prompt = "Export Set"
        panel.title = "Select Export Destination for '\(active.name)'"

        if panel.runModal() == .OK, let targetURL = panel.url {
            do {
                try ExportService.exportSetToDirectory(set: active, storage: storage, targetDirectory: targetURL)
                alertMessage = "Successfully exported '\(active.name)' to \(targetURL.path)"
                isAlertPresented = true
            } catch {
                alertMessage = "Export failed: \(error.localizedDescription)"
                isAlertPresented = true
            }
        }
    }
}
