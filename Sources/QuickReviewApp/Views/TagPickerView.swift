import SwiftUI

public struct TagChipView: View {
    public let tag: String
    public let isSelected: Bool
    public var onSelect: (() -> Void)? = nil
    public var onDelete: (() -> Void)? = nil

    public var body: some View {
        HStack(spacing: 4) {
            Text(tag)
                .font(.system(size: 11, weight: .medium))

            if let onDelete = onDelete {
                Button(action: onDelete) {
                    Image(systemName: "xmark.circle.fill")
                        .font(.system(size: 10))
                }
                .buttonStyle(.plain)
                .foregroundColor(.secondary)
            }
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(
            RoundedRectangle(cornerRadius: 6)
                .fill(isSelected ? Color.accentColor.opacity(0.2) : Color.gray.opacity(0.15))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 6)
                .stroke(isSelected ? Color.accentColor : Color.clear, lineWidth: 1)
        )
        .foregroundColor(isSelected ? .accentColor : .primary)
        .contentShape(Rectangle())
        .onTapGesture {
            onSelect?()
        }
    }
}

public struct TagInputField: View {
    @Binding public var tags: [String]
    @State private var newTagText: String = ""

    public var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: "tag")
                    .foregroundColor(.secondary)

                TextField("Add tags (press Return or comma)...", text: $newTagText)
                    .textFieldStyle(.roundedBorder)
                    .onSubmit {
                        addTag()
                    }
                    .onChange(of: newTagText) { _, newValue in
                        if newValue.hasSuffix(",") {
                            newTagText = String(newValue.dropLast())
                            addTag()
                        }
                    }

                Button("Add") {
                    addTag()
                }
                .disabled(newTagText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }

            if !tags.isEmpty {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 6) {
                        ForEach(tags, id: \.self) { tag in
                            TagChipView(tag: tag, isSelected: false) {
                                // delete tag
                                withAnimation {
                                    tags.removeAll { $0 == tag }
                                }
                            }
                        }
                    }
                    .padding(.vertical, 2)
                }
            }
        }
    }

    private func addTag() {
        let trimmed = newTagText.trimmingCharacters(in: .whitespacesAndNewlines)
        if !trimmed.isEmpty && !tags.contains(trimmed) {
            withAnimation {
                tags.append(trimmed)
            }
            newTagText = ""
        }
    }
}
