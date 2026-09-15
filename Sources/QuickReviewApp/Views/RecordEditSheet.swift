import SwiftUI
import AppKit

public struct RecordEditSheet: View {
    @Bindable public var appState: AppState
    public let recordToEdit: ReviewRecord? // nil = Quick Add mode

    @Environment(\.dismiss) private var dismiss

    @State private var title: String = ""
    @State private var descriptionText: String = ""
    @State private var tags: [String] = []
    @State private var newImageData: Data? = nil
    @State private var shouldRemoveImage: Bool = false
    @State private var existingImage: NSImage? = nil

    @FocusState private var isTitleFocused: Bool

    public init(appState: AppState, recordToEdit: ReviewRecord? = nil) {
        self.appState = appState
        self.recordToEdit = recordToEdit
    }

    private var isEditMode: Bool {
        recordToEdit != nil
    }

    public var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    // Title Field
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Title *")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(.secondary)

                        TextField("Enter record title...", text: $title)
                            .textFieldStyle(.roundedBorder)
                            .font(.system(size: 14))
                            .focused($isTitleFocused)
                    }

                    // Tags Field
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Tags")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(.secondary)

                        TagInputField(tags: $tags)
                    }

                    // Image Section
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Image Attachment (Optional)")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(.secondary)

                        ImageDropzoneView(
                            existingImage: existingImage,
                            newImageData: $newImageData,
                            shouldRemoveExisting: $shouldRemoveImage,
                            maxHeight: 220
                        )
                    }

                    // Description Field
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Description & Notes")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(.secondary)

                        TextEditor(text: $descriptionText)
                            .font(.system(size: 13))
                            .frame(minHeight: 120)
                            .padding(4)
                            .background(Color.gray.opacity(0.08))
                            .cornerRadius(8)
                            .overlay(
                                RoundedRectangle(cornerRadius: 8)
                                    .stroke(Color.gray.opacity(0.2), lineWidth: 1)
                            )
                    }

                    if let editRec = recordToEdit {
                        HStack(spacing: 20) {
                            FormattedDateView(label: "Created", date: editRec.createdAt)
                            FormattedDateView(label: "Modified", date: editRec.modifiedAt)
                        }
                        .padding(.top, 4)
                    }
                }
                .padding(20)
            }
            .navigationTitle(isEditMode ? "Edit Record" : "New Record")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .keyboardShortcut(.cancelAction)
                }

                ToolbarItem(placement: .confirmationAction) {
                    HStack(spacing: 8) {
                        if !isEditMode {
                            Button("Save & Add Next") {
                                saveRecord()
                                resetForm()
                                isTitleFocused = true
                            }
                            .buttonStyle(.bordered)
                            .disabled(title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                            .help("Save and immediately create another record (⇧Return)")
                        }

                        Button(isEditMode ? "Save Changes" : "Save Record") {
                            saveRecord()
                            dismiss()
                        }
                        .buttonStyle(.borderedProminent)
                        .disabled(title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                        .keyboardShortcut(.defaultAction)
                    }
                }
            }
        }
        .frame(minWidth: 550, idealWidth: 620, minHeight: 520, idealHeight: 640)
        .onAppear {
            setupInitialState()
        }
    }

    private func setupInitialState() {
        if let rec = recordToEdit {
            title = rec.title
            descriptionText = rec.recordDescription
            tags = rec.tags
            if let active = appState.activeSet, let imgName = rec.imageFileName {
                existingImage = appState.storage.loadImage(fileName: imgName, for: active)
            }
        } else {
            // Auto paste if clipboard contains image on sheet open
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                isTitleFocused = true
            }
        }
    }

    private func saveRecord() {
        let trimmedTitle = title.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedTitle.isEmpty else { return }

        if let rec = recordToEdit {
            appState.updateRecord(
                recordId: rec.id,
                title: trimmedTitle,
                description: descriptionText,
                tags: tags,
                newImageData: newImageData,
                removeImage: shouldRemoveImage
            )
        } else {
            appState.addRecord(
                title: trimmedTitle,
                description: descriptionText,
                tags: tags,
                imageData: newImageData
            )
        }
    }

    private func resetForm() {
        title = ""
        descriptionText = ""
        tags = []
        newImageData = nil
        shouldRemoveImage = false
        existingImage = nil
    }
}
