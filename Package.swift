// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "QuickReview",
    platforms: [
        .macOS(.v14)
    ],
    products: [
        .executable(
            name: "QuickReview",
            targets: ["QuickReviewApp"]
        )
    ],
    targets: [
        .executableTarget(
            name: "QuickReviewApp",
            path: "Sources/QuickReviewApp"
        ),
        .testTarget(
            name: "QuickReviewTests",
            dependencies: ["QuickReviewApp"],
            path: "Tests/QuickReviewTests"
        )
    ]
)
