import SwiftUI

public struct FormattedDateView: View {
    public let label: String
    public let date: Date
    public let icon: String

    public init(label: String, date: Date, icon: String = "calendar") {
        self.label = label
        self.date = date
        self.icon = icon
    }

    public var body: some View {
        HStack(spacing: 5) {
            Image(systemName: icon)
                .foregroundColor(.secondary)
                .font(.caption)

            Text("\(label):")
                .font(.caption)
                .foregroundColor(.secondary)

            Text(date, style: .date)
                .font(.caption)
                .foregroundColor(.primary)

            Text(date, style: .time)
                .font(.caption)
                .foregroundColor(.secondary)
        }
    }
}
