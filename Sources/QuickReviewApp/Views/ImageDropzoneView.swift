import SwiftUI
import AppKit
import UniformTypeIdentifiers

public struct ImageDropzoneView: View {
    public let existingImage: NSImage?
    @Binding public var newImageData: Data?
    @Binding public var shouldRemoveExisting: Bool
    public var maxHeight: CGFloat = 260

    @State private var isTargeted: Bool = false
    @State private var previewImage: NSImage? = nil

    public init(
        existingImage: NSImage?,
        newImageData: Binding<Data?>,
        shouldRemoveExisting: Binding<Bool>,
        maxHeight: CGFloat = 260
    ) {
        self.existingImage = existingImage
        self._newImageData = newImageData
        self._shouldRemoveExisting = shouldRemoveExisting
        self.maxHeight = maxHeight
    }

    private var currentDisplayImage: NSImage? {
        if shouldRemoveExisting { return nil }
        if let preview = previewImage { return preview }
        if let data = newImageData, let img = NSImage(data: data) { return img }
        return existingImage
    }

    public var body: some View {
        VStack(spacing: 8) {
            if let displayImage = currentDisplayImage {
                // Image preview with overlay controls
                ZStack(alignment: .topTrailing) {
                    Image(nsImage: displayImage)
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(maxWidth: .infinity, maxHeight: maxHeight)
                        .background(Color.black.opacity(0.04))
                        .cornerRadius(8)
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(Color.gray.opacity(0.2), lineWidth: 1)
                        )

                    HStack(spacing: 6) {
                        Button(action: selectImageFromFile) {
                            Label("Change", systemImage: "photo")
                                .font(.caption)
                        }
                        .buttonStyle(.bordered)
                        .tint(.primary)

                        Button(action: pasteFromClipboard) {
                            Label("Paste", systemImage: "doc.on.clipboard")
                                .font(.caption)
                        }
                        .buttonStyle(.bordered)
                        .tint(.primary)

                        Button(action: removeImage) {
                            Image(systemName: "trash")
                                .foregroundColor(.red)
                        }
                        .buttonStyle(.bordered)
                    }
                    .padding(8)
                }
            } else {
                // Empty dropzone placeholder
                VStack(spacing: 12) {
                    Image(systemName: "photo.badge.plus")
                        .font(.system(size: 36))
                        .foregroundColor(isTargeted ? .accentColor : .secondary)

                    VStack(spacing: 4) {
                        Text("Drop an image here, or paste from clipboard (⌘V)")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(.primary)

                        Text("Supports PNG, JPEG, TIFF, WEBP, HEIC")
                            .font(.system(size: 11))
                            .foregroundColor(.secondary)
                    }

                    HStack(spacing: 12) {
                        Button(action: pasteFromClipboard) {
                            Label("Paste (⌘V)", systemImage: "doc.on.clipboard")
                        }
                        .buttonStyle(.borderedProminent)

                        Button(action: selectImageFromFile) {
                            Label("Browse...", systemImage: "folder")
                        }
                        .buttonStyle(.bordered)
                    }
                }
                .frame(maxWidth: .infinity)
                .frame(height: 160)
                .background(
                    RoundedRectangle(cornerRadius: 10)
                        .fill(isTargeted ? Color.accentColor.opacity(0.08) : Color.gray.opacity(0.05))
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(
                            isTargeted ? Color.accentColor : Color.gray.opacity(0.3),
                            style: StrokeStyle(lineWidth: 1.5, dash: [6, 4])
                        )
                )
            }
        }
        .onDrop(of: [.image, .fileURL], isTargeted: $isTargeted) { providers in
            handleDrop(providers: providers)
        }
    }

    private func pasteFromClipboard() {
        if let result = PasteboardService.getImageFromPasteboard() {
            previewImage = result.image
            newImageData = result.data
            shouldRemoveExisting = false
        }
    }

    private func selectImageFromFile() {
        let panel = NSOpenPanel()
        panel.allowedContentTypes = [.image, .png, .jpeg, .tiff, .webP, .heic]
        panel.allowsMultipleSelection = false
        panel.canChooseDirectories = false

        if panel.runModal() == .OK, let url = panel.url {
            if let result = PasteboardService.loadImageFromURL(url) {
                previewImage = result.image
                newImageData = result.data
                shouldRemoveExisting = false
            }
        }
    }

    private func removeImage() {
        withAnimation {
            previewImage = nil
            newImageData = nil
            shouldRemoveExisting = true
        }
    }

    private func handleDrop(providers: [NSItemProvider]) -> Bool {
        guard let provider = providers.first else { return false }

        // Check if provider can load image or file URL
        if provider.canLoadObject(ofClass: NSImage.self) {
            _ = provider.loadObject(ofClass: NSImage.self) { image, _ in
                if let nsImage = image as? NSImage, let data = PasteboardService.imageToPNGData(nsImage) {
                    DispatchQueue.main.async {
                        self.previewImage = nsImage
                        self.newImageData = data
                        self.shouldRemoveExisting = false
                    }
                }
            }
            return true
        }

        if provider.hasItemConformingToTypeIdentifier(UTType.fileURL.identifier) {
            _ = provider.loadItem(forTypeIdentifier: UTType.fileURL.identifier, options: nil) { item, _ in
                if let data = item as? Data, let url = URL(dataRepresentation: data, relativeTo: nil) {
                    if let result = PasteboardService.loadImageFromURL(url) {
                        DispatchQueue.main.async {
                            self.previewImage = result.image
                            self.newImageData = result.data
                            self.shouldRemoveExisting = false
                        }
                    }
                }
            }
            return true
        }

        return false
    }
}
