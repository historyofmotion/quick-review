import SwiftUI

public struct SidebarView: View {
    @Bindable public var appState: AppState
    @State private var setHovered: UUID? = nil

    public var body: some View {
        List(selection: $appState.selectedSetId) {
            Section {
                ForEach(appState.sets) { set in
                    HStack {
                        Image(systemName: "folder.fill")
                            .foregroundColor(.accentColor)
                            .font(.system(size: 13))

                        Text(set.name)
                            .font(.system(size: 13, weight: appState.selectedSetId == set.id ? .semibold : .regular))

                        Spacer()

                        Text("\(set.records.count)")
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(.secondary)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color.gray.opacity(0.15))
                            .clipShape(Capsule())
                    }
                    .tag(set.id)
                    .contextMenu {
                        Button(action: {
                            appState.setBeingRenamed = set
                            appState.isRenameSetSheetPresented = true
                        }) {
                            Label("Rename Set", systemImage: "pencil")
                        }

                        Button(action: {
                            appState.duplicateSet(set: set)
                        }) {
                            Label("Duplicate Set", systemImage: "plus.square.on.square")
                        }

                        Button(action: {
                            appState.exportCurrentSet()
                        }) {
                            Label("Export Set...", systemImage: "square.and.arrow.up")
                        }

                        Button(action: {
                            appState.storage.revealSetInFinder(set)
                        }) {
                            Label("Reveal in Finder", systemImage: "folder")
                        }

                        Divider()

                        Button(role: .destructive, action: {
                            appState.deleteSet(set: set)
                        }) {
                            Label("Delete Set", systemImage: "trash")
                        }
                    }
                }
            } header: {
                HStack {
                    Text("Review Sets")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(.secondary)

                    Spacer()

                    Button(action: {
                        appState.isNewSetSheetPresented = true
                    }) {
                        Image(systemName: "plus")
                            .font(.system(size: 12, weight: .bold))
                    }
                    .buttonStyle(.plain)
                    .help("Create New Set (⌘⇧N)")
                }
            }
        }
        .listStyle(.sidebar)
        .safeAreaInset(edge: .bottom) {
            VStack(spacing: 8) {
                Divider()
                HStack {
                    Button(action: {
                        appState.storage.revealRootInFinder()
                    }) {
                        Label("Open Finder Folder", systemImage: "folder.badge.gearshape")
                            .font(.system(size: 11))
                    }
                    .buttonStyle(.plain)
                    .foregroundColor(.secondary)

                    Spacer()

                    Button(action: {
                        appState.exportCurrentSet()
                    }) {
                        Image(systemName: "square.and.arrow.up")
                            .font(.system(size: 12))
                    }
                    .buttonStyle(.plain)
                    .foregroundColor(.secondary)
                    .help("Export Current Set")
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
            }
            .background(.ultraThinMaterial)
        }
    }
}
