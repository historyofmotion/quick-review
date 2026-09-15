import XCTest
@testable import QuickReviewApp

final class StorageServiceTests: XCTestCase {
    var tempDirectory: URL!
    var storage: StorageService!

    override func setUp() {
        super.setUp()
        let tempPath = NSTemporaryDirectory().appending("QuickReviewTest_\(UUID().uuidString)")
        tempDirectory = URL(fileURLWithPath: tempPath)
        storage = StorageService(customRootURL: tempDirectory)
    }

    override func tearDown() {
        if let temp = tempDirectory {
            try? FileManager.default.removeItem(at: temp)
        }
        super.tearDown()
    }

    func testDirectoryStructureCreation() {
        XCTAssertTrue(FileManager.default.fileExists(atPath: storage.setsDirectory.path))
    }

    func testSetAndRecordPersistence() {
        let newSet = ReviewSet(name: "Test Set")
        storage.saveSet(newSet)

        var loaded = storage.loadAllSets()
        XCTAssertTrue(loaded.contains(where: { $0.name == "Test Set" }))

        // Add record
        let record = ReviewRecord(title: "Record 1", recordDescription: "Desc 1", tags: ["TagA"])
        var updatedSet = newSet
        updatedSet.records.append(record)
        storage.saveSet(updatedSet)

        loaded = storage.loadAllSets()
        let fetchedSet = loaded.first(where: { $0.id == newSet.id })
        XCTAssertNotNil(fetchedSet)
        XCTAssertEqual(fetchedSet?.records.count, 1)
        XCTAssertEqual(fetchedSet?.records.first?.title, "Record 1")
        XCTAssertEqual(fetchedSet?.records.first?.tags, ["TagA"])
    }

    func testImageStorageAndDeletion() {
        let set = ReviewSet(name: "Image Test Set")
        storage.saveSet(set)

        // Mock 1x1 PNG data
        let dummyData = "MockImageData".data(using: .utf8)!
        let savedFileName = storage.saveImageData(dummyData, for: set)
        XCTAssertNotNil(savedFileName)

        let imageFileURL = storage.imageURL(fileName: savedFileName!, for: set)
        XCTAssertTrue(FileManager.default.fileExists(atPath: imageFileURL.path))

        // Delete image
        storage.deleteImage(fileName: savedFileName!, for: set)
        XCTAssertFalse(FileManager.default.fileExists(atPath: imageFileURL.path))
    }

    func testSortingOptions() {
        let oldDate = Date().addingTimeInterval(-1000)
        let midDate = Date().addingTimeInterval(-500)
        let newDate = Date()

        let r1 = ReviewRecord(title: "Alpha", createdAt: midDate, modifiedAt: oldDate, sortOrder: 2)
        let r2 = ReviewRecord(title: "Beta", createdAt: oldDate, modifiedAt: newDate, sortOrder: 0)
        let r3 = ReviewRecord(title: "Gamma", createdAt: newDate, modifiedAt: midDate, sortOrder: 1)

        let records = [r1, r2, r3]

        // Entry order
        let entrySorted = SortOption.entryOrder.sortRecords(records)
        XCTAssertEqual(entrySorted.map(\.title), ["Beta", "Gamma", "Alpha"])

        // Date Created Desc
        let dateCreatedSorted = SortOption.dateCreatedDesc.sortRecords(records)
        XCTAssertEqual(dateCreatedSorted.map(\.title), ["Gamma", "Alpha", "Beta"])

        // Date Modified Desc
        let dateModifiedSorted = SortOption.dateModifiedDesc.sortRecords(records)
        XCTAssertEqual(dateModifiedSorted.map(\.title), ["Beta", "Gamma", "Alpha"])

        // Title Asc
        let titleSorted = SortOption.titleAsc.sortRecords(records)
        XCTAssertEqual(titleSorted.map(\.title), ["Alpha", "Beta", "Gamma"])
    }

    func testExportMarkdownSummary() {
        let record = ReviewRecord(
            title: "Export Item",
            recordDescription: "Detailed text for export.",
            tags: ["Important"]
        )
        let set = ReviewSet(name: "Export Set", records: [record])

        let markdown = ExportService.generateMarkdownSummary(for: set)
        XCTAssertTrue(markdown.contains("# Export Set"))
        XCTAssertTrue(markdown.contains("Export Item"))
        XCTAssertTrue(markdown.contains("Detailed text for export."))
        XCTAssertTrue(markdown.contains("`Important`"))
    }
}
