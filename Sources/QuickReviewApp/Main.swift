import SwiftUI
import AppKit

@main
struct QuickReviewApp: App {
    @State private var appState = AppState()

    var body: some Scene {
        WindowGroup {
            MainView(appState: appState)
                .frame(minWidth: 900, minHeight: 600)
        }
        .commands {
            // File Menu Commands
            CommandGroup(replacing: .newItem) {
                Button("New Record") {
                    appState.isQuickAddSheetPresented = true
                }
                .keyboardShortcut("n", modifiers: .command)

                Button("New Review Set...") {
                    appState.isNewSetSheetPresented = true
                }
                .keyboardShortcut("n", modifiers: [.command, .shift])

                Divider()

                Button("Export Active Set...") {
                    appState.exportCurrentSet()
                }
                .keyboardShortcut("e", modifiers: [.command, .shift])

                Button("Reveal in Finder") {
                    if let active = appState.activeSet {
                        appState.storage.revealSetInFinder(active)
                    } else {
                        appState.storage.revealRootInFinder()
                    }
                }
            }

            // Record Actions Command Menu
            CommandMenu("Record") {
                Button("Full Review Mode") {
                    appState.startFullReview()
                }
                .keyboardShortcut(.return, modifiers: .command)

                Button("Edit Record") {
                    if let selectedId = appState.selectedRecordId,
                       let record = appState.activeSet?.records.first(where: { $0.id == selectedId }) {
                        appState.recordBeingEdited = record
                        appState.isEditRecordSheetPresented = true
                    }
                }
                .keyboardShortcut("e", modifiers: .command)
                .disabled(appState.selectedRecordId == nil)

                Button("Delete Record") {
                    if let selectedId = appState.selectedRecordId {
                        appState.deleteRecord(recordId: selectedId)
                    }
                }
                .keyboardShortcut(.delete, modifiers: .command)
                .disabled(appState.selectedRecordId == nil)

                Divider()

                Menu("Sort Records By") {
                    ForEach(SortOption.allCases) { option in
                        Button(option.rawValue) {
                            appState.setSortOption(option)
                        }
                    }
                }
            }
        }
    }
}
