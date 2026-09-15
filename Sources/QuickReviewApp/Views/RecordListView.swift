import SwiftUI

public struct RecordListView: View {
    @Bindable public var appState: AppState

    public var body: some View {
        VStack(spacing: 0) {
            // Filter / Search / Sort Bar
            VStack(spacing: 8) {
                HStack(spacing: 10) {
                    // Search Field
                    HStack {
                        Image(systemName: "magnifyingglass")
                            .foregroundColor(.secondary)
                            .font(.system(size: 13))

                        TextField("Search records in active set...", text: $appState.searchText)
                            .textFieldStyle(.plain)
                            .font(.system(size: 13))

                        if !appState.searchText.isEmpty {
                            Button(action: { appState.searchText = "" }) {
                                Image(systemName: "xmark.circle.fill")
                                    .foregroundColor(.secondary)
                                    .font(.system(size: 12))
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(6)
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(8)

                    // Sort Menu
                    Menu {
                        ForEach(SortOption.allCases) { option in
                            Button(action: {
                                appState.setSortOption(option)
                            }) {
                                HStack {
                                    Text(option.rawValue)
                                    if appState.sortOption == option {
                                        Image(systemName: "checkmark")
                                    }
                                }
                            }
                        }
                    } label: {
                        Label(appState.sortOption.rawValue, systemImage: "arrow.up.arrow.down")
                            .font(.system(size: 12))
                    }
                    .menuStyle(.borderlessButton)
                    .fixedSize()

                    // Quick Add Record Button
                    Button(action: {
                        appState.isQuickAddSheetPresented = true
                    }) {
                        Label("Add Record", systemImage: "plus")
                    }
                    .buttonStyle(.borderedProminent)
                    .help("Quick Add Record (⌘N)")
                }

                // Tag Filter Chips (if tags exist in active set)
                if !appState.allTagsInActiveSet.isEmpty {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 6) {
                            TagChipView(
                                tag: "All",
                                isSelected: appState.selectedTag == nil
                            ) {
                                appState.selectedTag = nil
                            }

                            ForEach(appState.allTagsInActiveSet, id: \.self) { tag in
                                TagChipView(
                                    tag: tag,
                                    isSelected: appState.selectedTag == tag
                                ) {
                                    if appState.selectedTag == tag {
                                        appState.selectedTag = nil
                                    } else {
                                        appState.selectedTag = tag
                                    }
                                }
                            }
                        }
                        .padding(.horizontal, 2)
                        .padding(.bottom, 4)
                    }
                }
            }
            .padding(.horizontal, 14)
            .padding(.top, 12)
            .padding(.bottom, 8)

            Divider()

            // Records List
            let records = appState.filteredAndSortedRecords
            if records.isEmpty {
                VStack(spacing: 12) {
                    Spacer()
                    Image(systemName: "doc.text.magnifyingglass")
                        .font(.system(size: 38))
                        .foregroundColor(.secondary)

                    if !appState.searchText.isEmpty || appState.selectedTag != nil {
                        Text("No matching records found")
                            .font(.system(size: 15, weight: .medium))
                            .foregroundColor(.secondary)

                        Button("Clear Filters") {
                            appState.searchText = ""
                            appState.selectedTag = nil
                        }
                        .buttonStyle(.bordered)
                    } else {
                        Text("No records in this set yet")
                            .font(.system(size: 15, weight: .medium))
                            .foregroundColor(.secondary)

                        Button(action: {
                            appState.isQuickAddSheetPresented = true
                        }) {
                            Label("Add First Record", systemImage: "plus")
                        }
                        .buttonStyle(.borderedProminent)
                    }
                    Spacer()
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                List(selection: $appState.selectedRecordId) {
                    ForEach(records) { record in
                        RecordRowView(
                            record: record,
                            isSelected: appState.selectedRecordId == record.id
                        )
                        .tag(record.id)
                        .contextMenu {
                            Button(action: {
                                appState.startFullReview(startingAt: record.id)
                            }) {
                                Label("Full Review", systemImage: "arrow.up.left.and.arrow.down.right")
                            }

                            Button(action: {
                                appState.recordBeingEdited = record
                                appState.isEditRecordSheetPresented = true
                            }) {
                                Label("Edit Record", systemImage: "pencil")
                            }

                            Divider()

                            Button(role: .destructive, action: {
                                appState.deleteRecord(recordId: record.id)
                            }) {
                                Label("Delete Record", systemImage: "trash")
                            }
                        }
                    }
                    .onMove(perform: appState.sortOption == .entryOrder ? { from, to in
                        appState.moveRecords(fromOffsets: from, toOffset: to)
                    } : nil)
                }
                .listStyle(.inset(alternatesRowBackgrounds: true))
            }
        }
    }
}
