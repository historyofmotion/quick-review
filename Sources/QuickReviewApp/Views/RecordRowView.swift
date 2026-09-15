import SwiftUI

public struct RecordRowView: View {
    public let record: ReviewRecord
    public let isSelected: Bool

    public var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            HStack {
                Text(record.title.isEmpty ? "Untitled Record" : record.title)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.primary)
                    .lineLimit(1)

                Spacer()

                if record.imageFileName != nil {
                    Image(systemName: "photo")
                        .font(.system(size: 11))
                        .foregroundColor(.secondary)
                }
            }

            if !record.recordDescription.isEmpty {
                Text(record.recordDescription)
                    .font(.system(size: 12))
                    .foregroundColor(.secondary)
                    .lineLimit(2)
                    .lineSpacing(2)
            }

            if !record.tags.isEmpty {
                HStack(spacing: 4) {
                    ForEach(record.tags.prefix(3), id: \.self) { tag in
                        Text(tag)
                            .font(.system(size: 10, weight: .medium))
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color.gray.opacity(0.12))
                            .cornerRadius(4)
                            .foregroundColor(.secondary)
                    }

                    if record.tags.count > 3 {
                        Text("+\(record.tags.count - 3)")
                            .font(.system(size: 10))
                            .foregroundColor(.secondary)
                    }
                }
                .padding(.top, 2)
            }
        }
        .padding(.vertical, 6)
        .contentShape(Rectangle())
    }
}
