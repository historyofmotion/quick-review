import SwiftUI
import AppKit

public struct RecordDetailView: View {
    @Bindable public var appState: AppState
    public let record: ReviewRecord

    @State private var loadedImage: NSImage? = nil
    @State private var isImageZoomed: Bool = false

    public var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Header & Action Bar
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 6) {
                        Text(record.title.isEmpty ? "Untitled Record" : record.title)
                            .font(.system(size: 24, weight: .bold))
                            .foregroundColor(.primary)

                        if !record.tags.isEmpty {
                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 6) {
                                    ForEach(record.tags, id: \.self) { tag in
                                        TagChipView(tag: tag, isSelected: appState.selectedTag == tag) {
                                            if appState.selectedTag == tag {
                                                appState.selectedTag = nil
                                            } else {
                                                appState.selectedTag = tag
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    Spacer()

                    HStack(spacing: 8) {
                        Button(action: {
                            appState.startFullReview(startingAt: record.id)
                        }) {
                            Label("Full Review", systemImage: "arrow.up.left.and.arrow.down.right")
                        }
                        .buttonStyle(.borderedProminent)
                        .help("Enter Full View Mode (⌘Return)")

                        Button(action: {
                            appState.recordBeingEdited = record
                            appState.isEditRecordSheetPresented = true
                        }) {
                            Label("Edit", systemImage: "pencil")
                        }
                        .buttonStyle(.bordered)
                        .help("Edit Record (⌘E)")

                        Button(role: .destructive, action: {
                            appState.deleteRecord(recordId: record.id)
                        }) {
                            Image(systemName: "trash")
                        }
                        .buttonStyle(.bordered)
                        .help("Delete Record (⌘Delete)")
                    }
                }

                Divider()

                // Timestamps info bar
                HStack(spacing: 20) {
                    FormattedDateView(
                        label: "Created",
                        date: record.createdAt,
                        icon: "calendar.badge.plus"
                    )

                    FormattedDateView(
                        label: "Modified",
                        date: record.modifiedAt,
                        icon: "clock.arrow.circlepath"
                    )

                    Spacer()
                }
                .padding(.vertical, 6)
                .padding(.horizontal, 12)
                .background(Color.gray.opacity(0.08))
                .cornerRadius(8)

                // Image Display (if available)
                if let image = loadedImage {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Attached Image")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(.secondary)

                        ZStack(alignment: .topTrailing) {
                            Image(nsImage: image)
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .frame(maxWidth: .infinity, maxHeight: 380)
                                .background(Color.black.opacity(0.03))
                                .cornerRadius(10)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 10)
                                        .stroke(Color.gray.opacity(0.2), lineWidth: 1)
                                )
                                .onTapGesture {
                                    isImageZoomed = true
                                }

                            Button(action: { isImageZoomed = true }) {
                                Image(systemName: "plus.magnifyingglass")
                                    .padding(6)
                                    .background(.ultraThinMaterial)
                                    .clipShape(Circle())
                            }
                            .buttonStyle(.plain)
                            .padding(8)
                            .help("Click to enlarge")
                        }
                    }
                }

                // Description
                VStack(alignment: .leading, spacing: 8) {
                    Text("Description & Notes")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(.secondary)

                    if record.recordDescription.isEmpty {
                        Text("No description provided.")
                            .font(.system(size: 14))
                            .foregroundColor(.secondary)
                            .italic()
                            .padding(.vertical, 8)
                    } else {
                        Text(record.recordDescription)
                            .font(.system(size: 14))
                            .lineSpacing(4)
                            .textSelection(.enabled)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding()
                            .background(Color.gray.opacity(0.05))
                            .cornerRadius(8)
                    }
                }

                Spacer(minLength: 40)
            }
            .padding(24)
        }
        .onAppear {
            loadImage()
        }
        .onChange(of: record.imageFileName) { _, _ in
            loadImage()
        }
        .sheet(isPresented: $isImageZoomed) {
            if let img = loadedImage {
                VStack {
                    HStack {
                        Spacer()
                        Button("Done") { isImageZoomed = false }
                            .keyboardShortcut(.cancelAction)
                            .padding()
                    }
                    Image(nsImage: img)
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .padding()
                }
                .frame(minWidth: 600, minHeight: 500)
            }
        }
    }

    private func loadImage() {
        guard let active = appState.activeSet, let fileName = record.imageFileName else {
            loadedImage = nil
            return
        }
        loadedImage = appState.storage.loadImage(fileName: fileName, for: active)
    }
}
