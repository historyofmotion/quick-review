import AppKit

public struct PasteboardService {
    /// Extracts an image and its PNG/JPEG data from the general pasteboard
    public static func getImageFromPasteboard() -> (image: NSImage, data: Data)? {
        let pasteboard = NSPasteboard.general

        // 1. Direct image types on clipboard (PNG, TIFF)
        if let types = pasteboard.types {
            if types.contains(.png), let data = pasteboard.data(forType: .png), let image = NSImage(data: data) {
                return (image, data)
            }
            if types.contains(.tiff), let data = pasteboard.data(forType: .tiff), let image = NSImage(data: data) {
                if let pngData = imageToPNGData(image) {
                    return (image, pngData)
                }
                return (image, data)
            }
        }

        // 2. File URLs on pasteboard (e.g. copied image file from Finder)
        if let urls = pasteboard.readObjects(forClasses: [NSURL.self], options: nil) as? [URL] {
            for url in urls {
                let pathExtension = url.pathExtension.lowercased()
                if ["png", "jpg", "jpeg", "webp", "gif", "heic", "tiff"].contains(pathExtension) {
                    if let image = NSImage(contentsOf: url), let data = try? Data(contentsOf: url) {
                        return (image, data)
                    }
                }
            }
        }

        // 3. Direct NSImage object
        if let images = pasteboard.readObjects(forClasses: [NSImage.self], options: nil) as? [NSImage], let image = images.first {
            if let data = imageToPNGData(image) {
                return (image, data)
            }
        }

        return nil
    }

    /// Converts NSImage to PNG data representation
    public static func imageToPNGData(_ image: NSImage) -> Data? {
        guard let tiffRepresentation = image.tiffRepresentation,
              let bitmapImage = NSBitmapImageRep(data: tiffRepresentation) else {
            return nil
        }
        return bitmapImage.representation(using: .png, properties: [:])
    }

    /// Converts file URL to image and data
    public static func loadImageFromURL(_ url: URL) -> (image: NSImage, data: Data)? {
        guard let image = NSImage(contentsOf: url),
              let data = try? Data(contentsOf: url) else {
            return nil
        }
        return (image, data)
    }
}
