import 'package:flutter/material.dart';

class VendorProfileScreen extends StatelessWidget {
  const VendorProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text('Vendor Profile'),
        elevation: 0,
        backgroundColor: Colors.transparent,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            Stack(
              clipBehavior: Clip.none,
              alignment: Alignment.bottomCenter,
              children: [
                // Cover Image
                Container(
                  height: 200,
                  width: double.infinity,
                  color: Colors.grey[300],
                  child: Image.network(
                    'https://via.placeholder.com/800x400',
                    fit: BoxFit.cover,
                    errorBuilder: (c, e, s) => const Icon(Icons.store, size: 50),
                  ),
                ),
                // Vendor Avatar
                const Positioned(
                  bottom: -40,
                  child: CircleAvatar(
                    radius: 50,
                    backgroundColor: Colors.white,
                    child: CircleAvatar(
                      radius: 46,
                      backgroundColor: Colors.blue,
                      child: Text('V', style: TextStyle(fontSize: 40, color: Colors.white)),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 50),
            
            // Info
            const Text('Tech Solutions Ltd.', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.star, color: Colors.amber, size: 20),
                Text(' 4.9 (500 reviews)', style: TextStyle(fontWeight: FontWeight.w500)),
              ],
            ),
            const SizedBox(height: 16),
            
            // Stats
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildStat('Services', '12'),
                _buildStat('Orders', '1.5k'),
                _buildStat('Member Since', '2023'),
              ],
            ),
            const Divider(height: 48),

            // Services Grid
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.0),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text('Services', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              ),
            ),
            const SizedBox(height: 16),
             GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 16),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                childAspectRatio: 0.8,
              ),
              itemCount: 4,
              itemBuilder: (context, index) {
                return Card(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        height: 100,
                        color: Colors.grey[200],
                        child: const Center(child: Icon(Icons.image)),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Service $index', style: const TextStyle(fontWeight: FontWeight.bold)),
                            const SizedBox(height: 4),
                            const Text('\$99.00', style: TextStyle(color: Colors.green)),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildStat(String label, String value) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        Text(label, style: const TextStyle(color: Colors.grey)),
      ],
    );
  }
}
