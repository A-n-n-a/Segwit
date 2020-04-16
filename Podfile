# Uncomment the next line to define a global platform for your project
 platform :ios, '12.0'

target 'Segwit' do
  # Comment the next line if you don't want to use dynamic frameworks
  use_frameworks!

  pod 'BitcoinCore.swift'
  pod 'BitcoinKit.swift'
  pod 'BitcoinCashKit.swift'
  pod 'DashKit.swift'
  pod 'LibWally', :git => 'https://github.com/blockchain/LibWally-Swift.git', :branch => 'master', :submodules => true

  target 'SegwitTests' do
    inherit! :search_paths
    # Pods for testing
  end

  target 'SegwitUITests' do
    # Pods for testing
  end

end
