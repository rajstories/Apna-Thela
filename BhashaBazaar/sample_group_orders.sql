INSERT INTO group_orders (created_by, supplier_name, item_name, unit, target_quantity, current_quantity, price_per_unit, discounted_price, area, time_window, status, expires_at) VALUES
('राम कुमार', 'राम वेजिटेबल मार्केट', 'प्याज', 'kg', 50, 15, '25.00', '22.00', 'Karol Bagh', '9-11am', 'active', NOW() + INTERVAL '2 hours'),
('सुनीता देवी', 'फ्रेश वेजी कॉर्नर', 'आलू', 'kg', 100, 30, '18.00', '15.00', 'Karol Bagh', '9-11am', 'active', NOW() + INTERVAL '90 minutes'),
('विकास शर्मा', 'मसाला हब', 'हल्दी पाउडर', 'kg', 20, 8, '120.00', '100.00', 'Lajpat Nagar', '9-11am', 'active', NOW() + INTERVAL '3 hours');

INSERT INTO group_order_participants (group_order_id, vendor_name, quantity) VALUES
((SELECT id FROM group_orders WHERE item_name = 'प्याज' LIMIT 1), 'राम कुमार', 10),
((SELECT id FROM group_orders WHERE item_name = 'प्याज' LIMIT 1), 'गीता शर्मा', 5),
((SELECT id FROM group_orders WHERE item_name = 'आलू' LIMIT 1), 'सुनीता देवी', 20),
((SELECT id FROM group_orders WHERE item_name = 'आलू' LIMIT 1), 'अजय सिंह', 10),
((SELECT id FROM group_orders WHERE item_name = 'हल्दी पाउडर' LIMIT 1), 'विकास शर्मा', 5),
((SELECT id FROM group_orders WHERE item_name = 'हल्दी पाउडर' LIMIT 1), 'मीना देवी', 3);
