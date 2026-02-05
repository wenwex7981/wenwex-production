import 'package:flutter/material.dart';

class ShortsScreen extends StatelessWidget {
  const ShortsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: PageView.builder(
        scrollDirection: Axis.vertical,
        itemCount: 10,
        itemBuilder: (context, index) {
          return Stack(
            children: [
              // Video Placeholder
              Container(
                color: Colors.grey[900],
                child: Center(
                  child: Icon(Icons.play_circle_fill, size: 80, color: Colors.white.withOpacity(0.5)),
                ),
              ),
              
              // Overlay Controls
              Positioned(
                right: 16,
                bottom: 100,
                child: Column(
                  children: [
                    _buildActionButton(Icons.favorite, '1.2k'),
                    const SizedBox(height: 20),
                    _buildActionButton(Icons.comment, '456'),
                    const SizedBox(height: 20),
                    _buildActionButton(Icons.share, 'Share'),
                  ],
                ),
              ),
              
              // Video Info
              Positioned(
                left: 16,
                bottom: 40,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const CircleAvatar(radius: 16, child: Icon(Icons.person, size: 20)),
                        const SizedBox(width: 8),
                        Text('Vendor Name $index', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.white),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text('Follow', style: TextStyle(color: Colors.white, fontSize: 10)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text('Amazing service demonstration #wenwex #service $index', style: const TextStyle(color: Colors.white)),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildActionButton(IconData icon, String label) {
    return Column(
      children: [
        Icon(icon, color: Colors.white, size: 30),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(color: Colors.white, fontSize: 12)),
      ],
    );
  }
}
