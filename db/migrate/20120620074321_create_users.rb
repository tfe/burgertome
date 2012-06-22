class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.integer :remote_id
      t.string :token
      t.string :display_name
      t.timestamps
    end
  end
end
