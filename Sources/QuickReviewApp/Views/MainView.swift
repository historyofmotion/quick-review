import SwiftUI

public struct MainView: View {
    @Bindable public var appState: AppState

    @State private var newSetName: String = ""
    @State private var renameSetName: String = ""
    @FocusState private var isSetNameFocused: Bool

    public var body: some View {
        NavigationSplitView {
            SidebarView(appState: appState)
                .navigationSplitViewColumnWidth(min: 200, ideal: 220, max: 300)
        } content: {
            RecordListView(appState: appState)
                .navigationSplitViewColumnWidth(min: 280, ideal: 340, max: 480)
        } detail: {
            if let selectedId = appState.selectedRecordId,
               let record = appState.activeSet?.records.first(where: { $0.id == selectedId }) {
                RecordDetailView(appState: appState, record: record)
            } else {
                VStack(spacing: 12) {
                    Image(systemName: "square.stack.3d.up")
                        .font(.system(size: 48))
                        .foregroundColor(.secondary)

                    Text("Select a record to view details")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(.secondary)

                    Button(action: {
                        appState.isQuickAddSheetPresented = true
                    }) {
                        Label("Add Record", systemImage: "plus")
                    }
                    .buttonStyle(.borderedProminent)
                    .padding(.top, 4)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .sheet(isPresented: $appState.isQuickAddSheetPresented) {
            RecordEditSheet(appState: appState, recordToEdit: nil)
        }
        .sheet(isPresented: $appState.isEditRecordSheetPresented) {
            if let editingRecord = appState.recordBeingEdited {
                RecordEditSheet(appState: appState, recordToEdit: editingRecord)
            }
        }
        .sheet(isPresented: $appState.isFullReviewActive) {
            FullReviewView(appState: appState)
                .frame(minWidth: 700, minHeight: 600)
        }
        .sheet(isPresented: $appState.isNewSetSheetPresented) {
            VStack(spacing: 16) {
                Text("Create New Review Set")
                    .font(.headline)

                TextField("Set Name (e.g. Design Specs, Flashcards)", text: $newSetName)
                    .textFieldStyle(.roundedBorder)
                    .focused($isSetNameFocused)
                    .onSubmit {
                        createSetAndDismiss()
                    }

                HStack {
                    Button("Cancel") {
                        newSetName = ""
                        appState.isNewSetSheetPresented = false
                    }
                    .keyboardShortcut(.cancelAction)

                    Spacer()

                    Button("Create Set") {
                        createSetAndDismiss()
                    }
                    .buttonStyle(.borderedProminent)
                    .disabled(newSetName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                    .keyboardShortcut(.defaultAction)
                }
            }
            .padding(20)
            .frame(width: 380)
            .onAppear {
                newSetName = ""
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                    isSetNameFocused = true
                }
            }
        }
        .sheet(isPresented: $appState.isRenameSetSheetPresented) {
            VStack(spacing: 16) {
                Text("Rename Review Set")
                    .font(.headline)

                TextField("New Name", text: $renameSetName)
                    .textFieldStyle(.roundedBorder)
                    .focused($isSetNameFocused)
                    .onSubmit {
                        renameSetAndDismiss()
                    }

                HStack {
                    Button("Cancel") {
                        renameSetName = ""
                        appState.isRenameSetSheetPresented = false
                    }
                    .keyboardShortcut(.cancelAction)

                    Spacer()

                    Button("Rename") {
                        renameSetAndDismiss()
                    }
                    .buttonStyle(.borderedProminent)
                    .disabled(renameSetName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                    .keyboardShortcut(.defaultAction)
                }
            }
            .padding(20)
            .frame(width: 380)
            .onAppear {
                renameSetName = appState.setBeingRenamed?.name ?? ""
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                    isSetNameFocused = true
                }
            }
        }
        .alert("Notice", isPresented: $appState.isAlertPresented) {
            Button("OK") { appState.isAlertPresented = false }
        } message: {
            Text(appState.alertMessage ?? "")
        }
    }

    private func createSetAndDismiss() {
        let trimmed = newSetName.trimmingCharacters(in: .whitespacesAndNewlines)
        if !trimmed.isEmpty {
            appState.createSet(name: trimmed)
            newSetName = ""
            appState.isNewSetSheetPresented = false
        }
    }

    private func renameSetAndDismiss() {
        let trimmed = renameSetName.trimmingCharacters(in: .whitespacesAndNewlines)
        if !trimmed.isEmpty, let target = appState.setBeingRenamed {
            appState.renameSet(set: target, newName: trimmed)
            renameSetName = ""
            appState.isRenameSetSheetPresented = false
        }
    }
}
