import SwiftUI
import AppKit

public struct FullReviewView: View {
    @Bindable public var appState: AppState

    @State private var currentImage: NSImage? = nil

    private var records: [ReviewRecord] {
        appState.filteredAndSortedRecords
    }

    private var currentIndex: Int {
        guard !records.isEmpty else { return 0 }
        return min(max(0, appState.fullReviewRecordIndex), records.count - 1)
    }

    private var currentRecord: ReviewRecord? {
        guard !records.isEmpty, currentIndex < records.count else { return nil }
        return records[currentIndex]
    }

    public var body: some View {
        ZStack {
            // Background
            Color(NSColor.windowBackgroundColor)
                .ignoresSafeArea()

            if let record = currentRecord {
                VStack(spacing: 0) {
                    // Top Review Navigation Bar
                    HStack {
                        Button(action: {
                            appState.exitFullReview()
                        }) {
                            Label("Exit Review", systemImage: "xmark.circle.fill")
                                .font(.system(size: 13, weight: .medium))
                        }
                        .buttonStyle(.plain)
                        .foregroundColor(.secondary)
                        .keyboardShortcut(.cancelAction) // Esc

                        Spacer()

                        // Progress counter
                        VStack(spacing: 3) {
                            Text("\(appState.activeSet?.name ?? "Set")")
                                .font(.system(size: 11, weight: .bold))
                                .foregroundColor(.secondary)

                            Text("Record \(currentIndex + 1) of \(records.count)")
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundColor(.primary)
                        }

                        Spacer()

                        HStack(spacing: 8) {
                            Button(action: {
                                appState.recordBeingEdited = record
                                appState.isEditRecordSheetPresented = true
                            }) {
                                Label("Edit", systemImage: "pencil")
                            }
                            .buttonStyle(.bordered)
                            .help("Edit Record (⌘E)")
                        }
                    }
                    .padding(.horizontal, 24)
                    .padding(.vertical, 14)
                    .background(.ultraThinMaterial)

                    // Progress bar
                    GeometryReader { geo in
                        let progress = records.isEmpty ? 0 : CGFloat(currentIndex + 1) / CGFloat(records.count)
                        ZStack(alignment: .leading) {
                            Rectangle()
                                .fill(Color.gray.opacity(0.15))
                                .frame(height: 3)

                            Rectangle()
                                .fill(Color.accentColor)
                                .frame(width: geo.size.width * progress, height: 3)
                                .animation(.easeInOut(duration: 0.2), value: progress)
                        }
                    }
                    .frame(height: 3)

                    // Main Card Content
                    ScrollView {
                        VStack(alignment: .leading, spacing: 22) {
                            // Title & Tags
                            VStack(alignment: .leading, spacing: 8) {
                                Text(record.title.isEmpty ? "Untitled Record" : record.title)
                                    .font(.system(size: 28, weight: .bold))
                                    .foregroundColor(.primary)
                                    .textSelection(.enabled)

                                if !record.tags.isEmpty {
                                    HStack(spacing: 6) {
                                        ForEach(record.tags, id: \.self) { tag in
                                            TagChipView(tag: tag, isSelected: false)
                                        }
                                    }
                                }
                            }

                            // Image Section (Full View)
                            if let image = currentImage {
                                ZStack {
                                    Image(nsImage: image)
                                        .resizable()
                                        .aspectRatio(contentMode: .fit)
                                        .frame(maxWidth: .infinity)
                                        .frame(maxHeight: 460)
                                        .cornerRadius(12)
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 12)
                                                .stroke(Color.gray.opacity(0.25), lineWidth: 1)
                                        )
                                }
                                .padding(.vertical, 4)
                            }

                            // Description Section
                            VStack(alignment: .leading, spacing: 10) {
                                Text("Description")
                                    .font(.system(size: 13, weight: .bold))
                                    .foregroundColor(.secondary)

                                if record.recordDescription.isEmpty {
                                    Text("No description provided.")
                                        .font(.system(size: 15))
                                        .foregroundColor(.secondary)
                                        .italic()
                                } else {
                                    Text(record.recordDescription)
                                        .font(.system(size: 15))
                                        .lineSpacing(5)
                                        .textSelection(.enabled)
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                        .padding(18)
                                        .background(Color(NSColor.controlBackgroundColor))
                                        .cornerRadius(10)
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 10)
                                                .stroke(Color.gray.opacity(0.15), lineWidth: 1)
                                        )
                                }
                            }

                            // Metadata Timestamps Footer
                            HStack(spacing: 24) {
                                FormattedDateView(
                                    label: "Date Created",
                                    date: record.createdAt,
                                    icon: "calendar.badge.plus"
                                )

                                FormattedDateView(
                                    label: "Last Modified",
                                    date: record.modifiedAt,
                                    icon: "clock.arrow.circlepath"
                                )

                                Spacer()
                            }
                            .padding(.vertical, 8)
                            .padding(.horizontal, 14)
                            .background(Color.gray.opacity(0.06))
                            .cornerRadius(8)
                        }
                        .padding(32)
                        .frame(maxWidth: 820)
                    }

                    // Bottom Navigation Bar
                    HStack {
                        Button(action: {
                            withAnimation(.easeInOut(duration: 0.15)) {
                                appState.previousReviewRecord()
                            }
                        }) {
                            HStack(spacing: 6) {
                                Image(systemName: "arrow.left")
                                Text("Previous (← or K)")
                            }
                            .padding(.horizontal, 16)
                            .padding(.vertical, 8)
                        }
                        .buttonStyle(.bordered)
                        .disabled(currentIndex <= 0)

                        Spacer()

                        Text("\(currentIndex + 1) / \(records.count)")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(.secondary)

                        Spacer()

                        Button(action: {
                            withAnimation(.easeInOut(duration: 0.15)) {
                                appState.nextReviewRecord()
                            }
                        }) {
                            HStack(spacing: 6) {
                                Text(currentIndex == records.count - 1 ? "Done" : "Next (→ or Space)")
                                Image(systemName: currentIndex == records.count - 1 ? "checkmark" : "arrow.right")
                            }
                            .padding(.horizontal, 16)
                            .padding(.vertical, 8)
                        }
                        .buttonStyle(.borderedProminent)
                    }
                    .padding(.horizontal, 32)
                    .padding(.vertical, 14)
                    .background(.ultraThinMaterial)
                }
            } else {
                VStack(spacing: 12) {
                    Text("No records to review.")
                        .font(.title2)
                        .foregroundColor(.secondary)

                    Button("Close") {
                        appState.exitFullReview()
                    }
                    .buttonStyle(.borderedProminent)
                }
            }
        }
        .onAppear {
            loadImage()
        }
        .onChange(of: currentRecord?.id) { _, _ in
            loadImage()
        }
        .onKeyPress(.leftArrow) {
            withAnimation(.easeInOut(duration: 0.15)) {
                appState.previousReviewRecord()
            }
            return .handled
        }
        .onKeyPress(.rightArrow) {
            withAnimation(.easeInOut(duration: 0.15)) {
                appState.nextReviewRecord()
            }
            return .handled
        }
        .onKeyPress(.space) {
            withAnimation(.easeInOut(duration: 0.15)) {
                appState.nextReviewRecord()
            }
            return .handled
        }
        .onKeyPress(KeyEquivalent("j")) {
            withAnimation(.easeInOut(duration: 0.15)) {
                appState.nextReviewRecord()
            }
            return .handled
        }
        .onKeyPress(KeyEquivalent("k")) {
            withAnimation(.easeInOut(duration: 0.15)) {
                appState.previousReviewRecord()
            }
            return .handled
        }
        .onKeyPress(.escape) {
            appState.exitFullReview()
            return .handled
        }
    }

    private func loadImage() {
        guard let active = appState.activeSet,
              let record = currentRecord,
              let imgFileName = record.imageFileName else {
            currentImage = nil
            return
        }
        currentImage = appState.storage.loadImage(fileName: imgFileName, for: active)
    }
}
